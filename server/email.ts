import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmailData {
  to: string;
  funcionarioNome: string;
  data: string;
  horario: string;
}

export async function sendConfirmationEmail(emailData: EmailData): Promise<boolean> {
  try {
    const dataFormatada = format(new Date(emailData.data + 'T00:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    
    const emailBody = {
      to: emailData.to,
      subject: "Consulta Psicológica Aprovada - NEXT Implementos",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background-color: white; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
            h1 { margin: 0; font-size: 24px; }
            h2 { color: #2563eb; margin-top: 0; }
            .highlight { font-size: 18px; font-weight: bold; color: #2563eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Consulta Aprovada!</h1>
            </div>
            <div class="content">
              <p>Olá, <strong>${emailData.funcionarioNome}</strong>!</p>
              
              <p>Sua solicitação de atendimento psicológico foi aprovada pela equipe de psicologia da NEXT Implementos.</p>
              
              <div class="info-box">
                <h2>📅 Detalhes da Consulta</h2>
                <p><strong>Data:</strong> <span class="highlight">${dataFormatada}</span></p>
                <p><strong>Horário:</strong> <span class="highlight">${emailData.horario}</span></p>
              </div>
              
              <p>Por favor, compareça no horário agendado. Caso não possa comparecer, entre em contato com antecedência.</p>
              
              <p>Estamos aqui para apoiá-lo(a)!</p>
              
              <div class="footer">
                <p><strong>NEXT Implementos</strong><br>
                Equipe de Psicologia</p>
                <p style="font-size: 12px; margin-top: 20px;">Este é um email automático, por favor não responda.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Olá, ${emailData.funcionarioNome}!

Sua solicitação de atendimento psicológico foi aprovada pela equipe de psicologia da NEXT Implementos.

DETALHES DA CONSULTA:
Data: ${dataFormatada}
Horário: ${emailData.horario}

Por favor, compareça no horário agendado. Caso não possa comparecer, entre em contato com antecedência.

Estamos aqui para apoiá-lo(a)!

NEXT Implementos
Equipe de Psicologia
      `.trim(),
    };

    // Check if Gmail integration is configured
    const gmailToken = process.env.GMAIL_ACCESS_TOKEN;
    
    if (!gmailToken) {
      console.warn("Gmail not configured - email would be sent to:", emailData.to);
      console.warn("Subject:", emailBody.subject);
      console.warn("Body preview:", emailBody.text.substring(0, 200) + "...");
      return false;
    }

    // Gmail API implementation would go here
    // For now, this is a placeholder that will work once Gmail is configured
    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${gmailToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: Buffer.from(
          `To: ${emailBody.to}\r\n` +
          `Subject: ${emailBody.subject}\r\n` +
          `Content-Type: text/html; charset=utf-8\r\n\r\n` +
          emailBody.html
        ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
      }),
    });

    if (!response.ok) {
      console.error("Failed to send email:", await response.text());
      return false;
    }

    console.log("Email sent successfully to:", emailData.to);
    return true;

  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
