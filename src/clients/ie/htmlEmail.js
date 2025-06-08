module.exports = {

    resetPass: (name, token) => {
        return new Promise((resolve, reject) => {
            let resetLink = `http://localhost:3000/ie/reset-senha?token=${token}`;
            
            let html = `
            <img src="cid:nextTalents.png" alt="Logo Next Talents" style="width: 150px; margin-bottom: 20px;" />
            <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                <h2 style="color: #333333;">Olá, ${name}</h2>
                <p style="font-size: 16px; color: #555555;">
                    Recebemos uma solicitação para redefinir sua senha no <strong>Next Talents</strong>.
                </p>
                <p style="font-size: 16px; color: #555555;">
                    Para redefinir sua senha, clique no botão abaixo:
                </p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" target="_blank" style="background-color: #5bb38b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                    Redefinir Senha
                    </a>
                </div>
                <p style="font-size: 14px; color: #777777;">
                    Se você não solicitou essa mudança, ignore este e-mail.
                </p>
                <p style="font-size: 12px; color: #999999; margin-top: 30px;">
                    Este link é válido por 1 hora.
                </p>
                </div>
            </div>
            `;

            resolve(html);
        });
    },

    confirmEmail: (name, token) => {
        return new Promise((resolve, reject) => {
            const activationLink = `http://localhost:3000/ie/confirma-email?token=${token}`;

            const html = `
              <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                  <h2 style="color: #333333;">Olá, ${name}</h2>
                  <p style="font-size: 16px; color: #555555;">
                    Obrigado por se cadastrar na plataforma <strong>Next Talents</strong>!
                  </p>
                  <p style="font-size: 16px; color: #555555;">
                    Para ativar sua conta e começar a usar nossos serviços, clique no botão abaixo:
                  </p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${activationLink}" target="_blank" style="background-color: #5bb38b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                      Ativar Conta
                    </a>
                  </div>
                  <p style="font-size: 14px; color: #777777;">
                    Se você não solicitou esse cadastro, pode ignorar este e-mail.
                  </p>
                  <p style="font-size: 12px; color: #999999; margin-top: 30px;">
                    Este link é válido por 24 horas.
                  </p>
                </div>
              </div>
            `;
            

            resolve(html);
        });
    }
    

}