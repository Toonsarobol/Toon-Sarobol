import "./globals.css";

export const metadata = {
  title: "ประวัติเครื่องจักร",
  description: "ระบบบันทึกประวัติการบำรุงรักษาเครื่องจักรในอาคาร",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
