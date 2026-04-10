declare module "nodemailer" {
  const nodemailer: {
    createTransport: (options: any) => {
      sendMail: (mailOptions: any) => Promise<void>;
    };
  };

  export default nodemailer;
}

