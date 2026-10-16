from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=int(os.getenv("DB_PORT", "3307")),
        user=os.getenv("DB_USER", "ticketuser"),
        password=os.getenv("DB_PASSWORD", "ticketpassword"),
        database=os.getenv("DB_NAME", "ticketsdb")
    )


def create_table():
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            priority VARCHAR(20),
            category VARCHAR(100),
            status VARCHAR(20) DEFAULT 'OPEN'
        )
    """)

    connection.commit()
    cursor.close()
    connection.close()


@app.route("/")
def home():
    return "IT Support Ticket System Backend is running!"


@app.route("/tickets", methods=["POST"])
def create_ticket():

    data = request.json

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO tickets
        (title, description, priority, category, status)
        VALUES (%s, %s, %s, %s, %s)
    """

    values = (
        data.get("title"),
        data.get("description"),
        data.get("priority"),
        data.get("category"),
        "OPEN"
    )

    cursor.execute(query, values)
    connection.commit()

    ticket_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return jsonify({
        "id": ticket_id,
        "title": data.get("title"),
        "description": data.get("description"),
        "priority": data.get("priority"),
        "category": data.get("category"),
        "status": "OPEN"
    }), 201


@app.route("/tickets", methods=["GET"])
def get_tickets():

    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM tickets")
    tickets = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(tickets)

@app.route("/tickets/<int:ticket_id>", methods=["PUT"])
def update_ticket(ticket_id):

    data = request.json

    new_status = data.get("status")
    resolution = data.get("resolution")

    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        UPDATE tickets
        SET status = %s,
            resolution = %s
        WHERE id = %s
    """

    cursor.execute(
        query,
        (new_status, resolution, ticket_id)
    )

    connection.commit()

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        return jsonify({
            "error": "Ticket not found"
        }), 404

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Ticket updated successfully",
        "ticket_id": ticket_id,
        "status": new_status,
        "resolution": resolution
    })

if __name__ == "__main__":
    create_table()
    app.run(host="0.0.0.0", port=5000)