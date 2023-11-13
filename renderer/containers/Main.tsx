import * as React from 'react';
import styled from "@emotion/styled";

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
`

const Main: React.FC = () => {

  return (
    <Wrapper data-tauri-drag-region className="title-panel">

    </Wrapper>
  );
};

export default Main;
