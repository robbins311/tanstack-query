import { useIsFetching } from "@tanstack/react-query";

export default function Header({ children }) {
  //데이터를 가져올때마다 0보다 큰 수로 변함.. 아니면 0
  const fetching = useIsFetching();
  return (
    <>
      <div id="main-header-loading">{fetching > 0 && <progress />}</div>
      <header id="main-header">
        <div id="header-title">
          <h1>React Events</h1>
        </div>
        <nav>{children}</nav>
      </header>
    </>
  );
}
