import boto3
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from dotenv import load_dotenv
import os
import time

# Load environment variables
load_dotenv()

# Get environment variables
EMAIL_ADDRESS = os.getenv('email')
EMAIL_PASSWORD = os.getenv('password')
AWS_ACCESS_KEY = os.getenv('aws_access_key')
AWS_SECRET_ACCESS_KEY = os.getenv('aws_secret_access_key')

# Initialize DynamoDB resource with credentials
dynamodb = boto3.resource(
    'dynamodb',
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name='us-east-1'
)

# Email notification function
def send_email(to_email, subject, body):
    """Sends an email to the given email address."""
    try:
        # Create the email
        message = MIMEMultipart()
        message['From'] = EMAIL_ADDRESS
        message['To'] = to_email
        message['Subject'] = subject

        # Attach the plain text body
        message.attach(MIMEText(body, 'plain'))

        # Connect to the SMTP server and send the email
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, to_email, message.as_string())

        print(f"Email sent successfully to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")


def scan_sensor_data():
    """Scans the sensor data table and processes the most recent humidity for each plot."""
    try:
        # Query the sensor data table
        tablename = os.getenv('TABLE_NAME')
        table = dynamodb.Table(tablename)
        response = table.scan()

        # Dictionary to store the most recent humidity data
        most_recent_humidity = {}

        for item in response['Items']:
            plot = item['plot']
            date_epoch = int(item['timestamp'])
            humidity = int(item['humidity'])

            # Convert epoch time to a datetime object
            date = datetime.fromtimestamp(date_epoch)

            # Check if it's the most recent data for the plot
            if plot not in most_recent_humidity or date > most_recent_humidity[plot]['timestamp']:
                most_recent_humidity[plot] = {
                    'timestamp': date,
                    'humidity': humidity
                }
        return most_recent_humidity
    except Exception as e:
        print(f"Failed to scan sensor data: {e}")
        return {}


def get_users():
    """Fetches user data from the DynamoDB table."""
    try:
        table = dynamodb.Table("users")
        response = table.scan()
        return response.get('Items', [])
    except Exception as e:
        print(f"Failed to fetch user data: {e}")
        return []


def notify_users(most_recent_humidity, users):
    """Checks data thresholds and sends email notifications to users if necessary."""
    try:
        for user in users:
            for most_recent_plot, data in most_recent_humidity.items():
                if most_recent_plot in user['plots']:
                    if data['humidity'] < 30:  # Threshold for low humidity
                        subject = f"Low Humidity Alert for Plot {most_recent_plot}"
                        body = (
                            f"Hello {user['name']},\n\n"
                            f"The humidity in your plot {most_recent_plot} is currently {data['humidity']}%, "
                            f"which is below the recommended threshold. Please take appropriate action.\n\n"
                            f"Timestamp: {data['timestamp']}\n\n"
                            f"Best regards,\nSmart Garden Team"
                        )
                        send_email(user['email'], subject, body)
    except Exception as e:
        print(f"Error during user notification: {e}")


def main():
    """Main loop that checks the time and executes the logic at the specified time."""
    # Set the desired execution time
    target_hour = 10
    target_minute = 00

    last_executed_date = None  # Track the last date the function was executed

    try:
        while True:
            now = datetime.now()
            
            # Check if the current time matches the target time
            if now.hour == target_hour and now.minute == target_minute:
                if last_executed_date != now.date():  # Ensure it only runs once per day
                    print(f"Executing scan and notifications at {now}")
                    # Scan data and notify users
                    most_recent_humidity = scan_sensor_data()
                    users = get_users()
                    notify_users(most_recent_humidity, users)

                    # Update last executed date
                    last_executed_date = now.date()
                else:
                    print("Already executed today, waiting...")
            else:
                # print current time and difference from target time
                print(f"Current time: {now}, waiting for {target_hour}:{target_minute}")
                # calculate the time difference
                time_diff = datetime(now.year, now.month, now.day, target_hour, target_minute) - now
                print(f"Time remaining: {time_diff}")
            
            # Sleep briefly to avoid CPU spikes while checking
            time.sleep(1)
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
