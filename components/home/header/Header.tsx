import React from "react";
import { TopBar } from "./TopBar";
import { MidBar } from "./MidBar";
import { BottomBar } from "./bottomBar/BottomBar";
import { StickyBar } from "./StickyBar"; // Import the component

export const Header = () => {
  return (
    <>
      <div>
        <TopBar />
        <MidBar />
        <BottomBar />
      </div>

      {/* Mobile sticky bar - will show when header scrolls out of view */}
      <StickyBar />
    </>
  );
};
