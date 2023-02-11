import nodemailer from 'nodemailer';

export const emailRegistro = async (datos) => {
    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      });

    const {email, nombre, token} = datos;

    const info = await transport.sendMail({
        from: "UpTask - Administrador de Proyectos <cuentas@uptask.com>",
        to: email,
        subject: "Comprueba tu cuenta UpTask",
        text: "Comprueba tu cuenta UpTask",
        html: `<p>Hola ${nombre}, comprueba tu cuenta en UpTask</p>
               <p> Tu cuenta ya está lista, solo debes comprobar en el siguiente enlace: </p>
                <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta </a>
               <p>Si tu no creaste esta cuenta, puedes ignorar este mensaje</p>
            `
    });
};

export const emailOlvidePassword = async (datos) => {
  const transport = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

  const {email, nombre, token} = datos;

  const info = await transport.sendMail({
      from: "UpTask - Administrador de Proyectos <cuentas@uptask.com>",
      to: email,
      subject: "UpTask - Reestablece Tu Password",
      text: "UpTask - Reestable Tu Password",
      html: `<p>Hola ${nombre}, has solicitado reestablecer tu password UpTask</p>
             <p> Sigue el siguiente enlace para generar un nuevo password: </p>
              <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Reestablecer Password </a>
             <p>Si tu no solicitaste este email de reestablecimiento, puedes ignorar este mensaje</p>
          `
  });
};