import { Footer } from './footer'
import { Header } from './header'

export function DefaultLayout({ children }) {
  return (
    <div className="bg-background text-foreground flex min-h-screen flex-col transition-colors">
      <Header />

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  )
}
