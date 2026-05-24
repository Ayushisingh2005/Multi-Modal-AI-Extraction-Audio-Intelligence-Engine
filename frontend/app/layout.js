import './globals.css'

export const metadata = {
  title: 'LexiScript AI - High Fidelity Extraction',
  description: 'Multi-modal AI Engine',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* These sit behind the children */}
        <div className="bg-grid-system" />
        <div className="scanline" />
        
        {/* This is your actual content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  )
}