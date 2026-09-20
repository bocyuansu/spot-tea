/**
 * 前台外框的置中與斷點寬度階梯。
 *
 * Navbar、SiteChrome 與 Footer 三層必須對齊，否則導覽列、內容與頁尾的左右邊界會不一致，
 * 所以這串 class 只留這一份；各自的間距與排版才寫在自己的 className 裡。
 */
export const SITE_CONTAINER = 'mx-auto sm:px-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-7xl';
