// isPublicRoute.ts

export function isPublicRoute(pathname: string): boolean {
  // 1) 완전히 특정한 경로만 열려있게 할 수도 있고,
  // 2) 또는 startsWith, 정규표현식 등을 사용해서 부분 매칭할 수도 있음.

  // 예: 완전히 일치해야 하는 공개 경로들
  const exactPublicRoutes = [
    "/",
    "/home",
    "/public-posts",
    "/about",
    "/contact",
  ];

  // 예: 특정 패턴(하위 경로까지) 허용하려면
  // "/blog"로 시작하면 모두 허용이라든지...
  // const prefixPublicRoutes = ["/blog", "/static"];

  // 1) 우선 exact match 체크
  if (exactPublicRoutes.includes(pathname)) {
    return true;
  }

  // 2) prefix match가 필요하다면
  // if (prefixPublicRoutes.some(prefix => pathname.startsWith(prefix))) {
  //   return true;
  // }

  // 여기에 추가 로직(정규표현식 등)을 넣어도 됨
  // ...

  // 공개 라우트에 해당되지 않는 경우
  return false;
}
