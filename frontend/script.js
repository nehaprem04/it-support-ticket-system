const API_URL = "http://localhost:5000";


// ==========================================
// CREATE TICKET
// ==========================================

document.getElementById("ticketForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const ticket = {
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        category: document.getElementById("category").value
    };

    try {

        const response = await fetch(`${API_URL}/tickets`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(ticket)
        });

        const result = await response.json();

        if (response.ok) {

            document.getElementById("message").textContent =
                `Ticket #${result.id} created successfully!`;

            document.getElementById("ticketForm").reset();

            loadTickets();

        } else {

            document.getElementById("message").textContent =
                "Failed to create ticket.";
        }

    } catch (error) {

        document.getElementById("message").textContent =
            "Could not connect to backend.";

        console.error(error);
    }
});


// ==========================================
// LOAD / VIEW ALL TICKETS
// ==========================================

async function loadTickets() {

    try {

        const response = await fetch(`${API_URL}/tickets`);

        const tickets = await response.json();

        const container = document.getElementById("tickets");

        container.innerHTML = "";

        if (tickets.length === 0) {

            container.innerHTML = "<p>No tickets found.</p>";

            return;
        }


        tickets.forEach(ticket => {

            const ticketElement = document.createElement("div");

            ticketElement.className = "ticket";


            ticketElement.innerHTML = `

                <h3>
                    #${ticket.id} - ${ticket.title}
                </h3>

                <p>
                    <strong>Description:</strong>
                    ${ticket.description}
                </p>

                <p>
                    <strong>Priority:</strong>
                    ${ticket.priority}
                </p>

                <p>
                    <strong>Category:</strong>
                    ${ticket.category}
                </p>

                <p>
                    <strong>Status:</strong>

                    <select
                        id="status-${ticket.id}"
                        onchange="updateStatus(${ticket.id}, this.value)"
                    >

                        <option value="OPEN"
                            ${ticket.status === "OPEN" ? "selected" : ""}>
                            Open
                        </option>

                        <option value="IN PROGRESS"
                            ${ticket.status === "IN PROGRESS" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="RESOLVED"
                            ${ticket.status === "RESOLVED" ? "selected" : ""}>
                            Resolved
                        </option>

                        <option value="CLOSED"
                            ${ticket.status === "CLOSED" ? "selected" : ""}>
                            Closed
                        </option>

                    </select>
                </p>


                <p>
                    <strong>Resolution:</strong>
                    ${ticket.resolution || "Not provided"}
                </p>


                <textarea
                    id="resolution-${ticket.id}"
                    placeholder="Enter resolution details..."
                ></textarea>


                <button onclick="saveTicket(${ticket.id})">
                    Save Update
                </button>

            `;

            container.appendChild(ticketElement);

        });


    } catch (error) {

        document.getElementById("tickets").textContent =
            "Could not load tickets.";

        console.error(error);
    }
}


// ==========================================
// QUICK STATUS UPDATE
// ==========================================

async function updateStatus(ticketId, newStatus) {

    try {

        const response = await fetch(
            `${API_URL}/tickets/${ticketId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    status: newStatus
                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to update ticket"
            );

            return;
        }


        loadTickets();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend."
        );
    }
}


// ==========================================
// SAVE STATUS + RESOLUTION
// ==========================================

async function saveTicket(ticketId) {

    const status =
        document.getElementById(
            `status-${ticketId}`
        ).value;


    const resolution =
        document.getElementById(
            `resolution-${ticketId}`
        ).value;


    try {

        const response = await fetch(
            `${API_URL}/tickets/${ticketId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    status: status,

                    resolution: resolution

                })
            }
        );


        const result = await response.json();


        if (!response.ok) {

            alert(
                result.error ||
                "Failed to update ticket"
            );

            return;
        }


        loadTickets();


    } catch (error) {

        console.error(error);

        alert(
            "Could not connect to backend."
        );
    }
}


// ==========================================
// LOAD TICKETS WHEN PAGE OPENS
// ==========================================

loadTickets();