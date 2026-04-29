import styles from './global.module.scss'
import Sidebar from '../components/sidebar/sidebar'
import { ZCOOL_XiaoWei } from 'next/font/google'


const zhFont = ZCOOL_XiaoWei({
  weight: '400',
  subsets: ['latin'],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <body>
        <div className={styles.layoutWrapper}> 
          <Sidebar />
          <main className={styles.mainContent}>
           <div className={styles.contentContainer}>
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}