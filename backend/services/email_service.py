import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
MAX_RETRIES = 3


def _send(to: str, subject: str, html: str) -> None:
    if not SMTP_USER or not SMTP_PASS:
        print(f"[email] SMTP non configuré — email non envoyé à {to}: {subject}")
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = FROM_EMAIL
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(FROM_EMAIL, to, msg.as_string())
        print(f"[email] Envoyé à {to}: {subject}")
    except Exception as e:
        print(f"[email] Échec d'envoi à {to}: {e}")


def send_publish_success(to: str, username: str, title: str) -> None:
    _send(
        to=to,
        subject="✅ Vidéo publiée sur TikTok — DevinetteLab",
        html=f"""
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#ff6b00">✅ Vidéo publiée !</h2>
          <p>Bonjour <strong>@{username}</strong>,</p>
          <p>Votre vidéo <strong>"{title}"</strong> a été publiée avec succès sur TikTok.</p>
          <p style="margin-top:24px;color:#888;font-size:12px">DevinetteLab</p>
        </div>
        """,
    )


def send_publish_failure(to: str, username: str, title: str, error: str, retry_count: int) -> None:
    if retry_count < MAX_RETRIES:
        subject = f"⚠️ Erreur de publication — tentative {retry_count}/{MAX_RETRIES}"
        body = f"""
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#f59e0b">⚠️ Erreur de publication</h2>
          <p>La publication de <strong>"{title}"</strong> a échoué (tentative {retry_count}/{MAX_RETRIES}).</p>
          <p><strong>Erreur :</strong> {error}</p>
          <p>Une nouvelle tentative sera effectuée automatiquement dans 5 minutes.</p>
        </div>
        """
    else:
        subject = "❌ Publication échouée — action requise"
        body = f"""
        <div style="font-family:sans-serif;max-width:500px;margin:auto">
          <h2 style="color:#ef4444">❌ Publication définitivement échouée</h2>
          <p>La publication de <strong>"{title}"</strong> a échoué après {MAX_RETRIES} tentatives.</p>
          <p><strong>Dernière erreur :</strong> {error}</p>
          <p>Connectez-vous à <a href="https://devinettelab.com">DevinetteLab</a> pour republier.</p>
        </div>
        """
    _send(to=to, subject=subject, html=body)
