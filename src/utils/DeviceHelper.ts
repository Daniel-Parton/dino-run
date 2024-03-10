export const  isMobileDevice = () => {
    return !!(
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i)|| 
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i))
  }

type HeightWidth = { width: number, height: number };

export const DesktopSize: HeightWidth = { width: 800, height: 600 };
export const MobileSize: HeightWidth = { width: 540, height: 960 };

export const ShouldBeMobileSize = () => window.innerWidth < window.innerHeight;

export const GetSizeByWindow = () => {
  return ShouldBeMobileSize() ? MobileSize : DesktopSize;
}