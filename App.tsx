import React from "react";

import { InteractiveDemo } from "./components/InteractiveDemo";
import { Footer } from "./components/Footer";

const App: React.FC = () => {
  return (
    <>
      <main className="container mx-auto px-4 py-8 md:py-16">
        <InteractiveDemo />
      </main>
      <Footer />
    </>
  );
};

export default App;
