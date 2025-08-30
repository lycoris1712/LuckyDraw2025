// ---------- Shared ----------
const submitBtn = document.getElementById("submitBtn");
const nameInput = document.getElementById("nameInput");
const assignedNumber = document.getElementById("assignedNumber");
const seatsContainer = document.getElementById("seatsContainer");

// Create seats 300-1300
let allSeats = [];
for (let i = 300; i <= 1300; i++) allSeats.push(i);

// Render seats
function renderSeats(takenNumbers = []) {
  seatsContainer.innerHTML = '';
  allSeats.forEach(num => {
    const div = document.createElement("div");
    div.className = "seat";
    div.innerText = num;
    if (takenNumbers.includes(num)) div.classList.add("taken");
    seatsContainer.appendChild(div);
  });
}

// Listen real-time updates
db.collection("participants").onSnapshot(snapshot => {
  const takenNumbers = snapshot.docs.map(doc => parseInt(doc.id));
  renderSeats(takenNumbers);
});

// ---------- Tourist Page ----------
if(submitBtn){
  submitBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if(!name) return alert("Please enter your name");

    // Get all taken numbers
    const takenSnapshot = await db.collection("participants").get();
    const takenNumbers = takenSnapshot.docs.map(doc => parseInt(doc.id));

    // Find available numbers
    const availableNumbers = allSeats.filter(num => !takenNumbers.includes(num));
    if(availableNumbers.length === 0) return alert("Sorry, all numbers are taken!");

    // Pick random number
    const randomNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    // Save to Firestore
    await db.collection("participants").doc(randomNum.toString()).set({
      name: name,
      number: randomNum
    });

    assignedNumber.innerText = `Hello ${name}, your lucky number is ${randomNum}!`;
  });
}

// ---------- Admin Page ----------
const participantsList = document.getElementById("participantsList");
const spinBtn = document.getElementById("spinBtn");
const winnersList = document.getElementById("winnersList");

if(participantsList){
  // Show participants live
  db.collection("participants").onSnapshot(snapshot => {
    participantsList.innerHTML = '';
    snapshot.docs.forEach(doc => {
      const p = document.createElement("p");
      p.innerText = `${doc.data().name} - ${doc.data().number}`;
      participantsList.appendChild(p);
    });
  });

  // Spin wheel for 30 winners
  spinBtn.addEventListener("click", async () => {
    const snapshot = await db.collection("participants").get();
    const participants = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));

    if(participants.length < 30) return alert("Not enough participants yet!");

    // Shuffle and pick 30 winners
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const winners = shuffled.slice(0,30);

    winnersList.innerHTML = '';
    winners.forEach(w => {
      const p = document.createElement("p");
      p.innerText = `${w.name} - ${w.number}`;
      winnersList.appendChild(p);

      // Save to winners collection
      db.collection("winners").doc(w.id).set(w);
    });
  });
}
