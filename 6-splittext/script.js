document.fonts.ready.then(() => {
  let split = SplitText.create(".type", {
    type: "lines, words, chars",
    aria: "hidden",
    autoSplit: true,
    smartWrap: true,
    charsClass: "letter++",
    onSplit: (self) => {
      return gsap.from(self.chars, {
        // yPercent: "random(-100, 100)",
        // rotation: "random(-20, 20)",
        duration: 1,
        // yoyo: true,
        repeat: 1,
        scrambleText: {
          chars: "0000000000",
          speed: 0.1,
          // iterations: 1000,
          // charsClass: "letter",
        },
        stagger: {
          amount: 0.5,
          from: "random",
        },
        onComplete: () => {
          split.revert();
        },
      });
    }
  });

  console.log(split.vars);
});