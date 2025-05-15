document.addEventListener('DOMContentLoaded', () => {
  const galaxy = document.querySelector('.galaxy');
  const orbitContainer = document.querySelector('.galaxy .orbit-container');
  const sun = document.querySelector('.galaxy svg.sun');
  const planets = document.querySelectorAll('.galaxy svg.planet');

  // 初始渲染动画 - 从小到大缩放效果
  gsap.set([galaxy, sun, planets], { scale: 0 });
  gsap.to([galaxy, sun, planets], {
    duration: 1.5,
    scale: 1,
    ease: "power2.inOut",
    stagger: 0.8
  });

  // 太阳点击状态
  let isSunZoomed = false;

  // 初始化3D旋转角度
  let rotationX = 0;
  const MAX_ROTATION = 45; // 设置最大旋转角度

  // 添加鼠标滚轮事件
  galaxy.addEventListener('wheel', (e) => {
    e.preventDefault();
    // 根据滚轮方向调整旋转角度（向下滚动角度变小，向上滚动角度变大）
    rotationX -= e.deltaY * 0.01;
    // 限制旋转角度范围
    rotationX = Math.max(Math.min(rotationX, MAX_ROTATION), -MAX_ROTATION);
    // 应用3D旋转
    gsap.to(galaxy, {
      duration: 0.5,
      rotateX: rotationX,
      transformOrigin: "center center",
      ease: "power2.out"
    });

    // 太阳和行星反向旋转
    // 这里不能这么做，因为本质上是两次投影，不是一个真正的立体旋转
    // gsap.to(sun, {
    //   duration: 0.5,
    //   rotation: -rotationX,
    //   transformOrigin: "center center",
    //   ease: "power2.out"
    // });

    // planets.forEach(planet => {
    //   gsap.to(planet, {
    //     duration: 0.5,
    //     rotation: -rotationX,
    //     transformOrigin: "center center",
    //     ease: "power2.out"
    //   });
    // });
  });

  // 轨道参数
  const orbits = [
    { radius: 100, speed: 8 },
    { radius: 180, speed: 6 },
    { radius: 260, speed: 4 }
  ];

  // 创建轨迹
  // 先清空已有轨道，避免重复
  while (orbitContainer.firstChild) {
    orbitContainer.removeChild(orbitContainer.firstChild);
  }
  orbits.forEach((orbit) => {
    const ns = "http://www.w3.org/2000/svg";
    const orbitCircle = document.createElementNS(ns, "circle");
    orbitCircle.setAttribute("cx", "0");
    orbitCircle.setAttribute("cy", "0");
    orbitCircle.setAttribute("r", orbit.radius.toString());
    orbitCircle.setAttribute("fill", "none");
    orbitCircle.setAttribute("stroke", "#ddd");
    orbitCircle.setAttribute("stroke-width", "1");
    orbitCircle.setAttribute("class", "orbit-track");
    orbitContainer.appendChild(orbitCircle);
  });

  // 为每个行星创建fromTo动画
  planets.forEach((planet, index) => {
    const orbit = orbits[index];
    const planetTween = gsap.fromTo(planet,
      {
        x: orbit.radius - 15,
        y: 0
      },
      {
        duration: 100 / orbit.speed,
        repeat: -1,
        ease: "none",
        onUpdate: function () {
          const progress = this.progress();
          const angle = progress * Math.PI * 2;
          const x = Math.cos(angle) * orbit.radius - 15;
          const y = Math.sin(angle) * orbit.radius - 15;
          gsap.set(planet, {
            x: x,
            y: y
          });
        }
      }
    );

    // 添加鼠标悬停事件
    planet.addEventListener('mouseenter', () => {
      if (!isZoomed) {
        planetTween.timeScale(0.3); // 悬停时减速
      }
    });

    planet.addEventListener('mouseleave', () => {
      if (!isZoomed) {
        planetTween.timeScale(1); // 移开时恢复正常速度
      }
    });

    // 添加点击事件
    let isZoomed = false;
    planet.addEventListener('click', () => {
      if (!isZoomed) {
        //进入动画
        // 放大当前行星并居中
        gsap.to(planet, {
          duration: 0.5,
          scale: 5,
          x: -15,
          y: -15,
          ease: "power2.out"
        });

        // 淡出其他行星、太阳和轨道
        planets.forEach(p => {
          if (p !== planet) {
            gsap.to(p, {
              duration: 0.5,
              opacity: 0,
              ease: "power3.out"
            });
          }
        });
        gsap.to([sun, orbitContainer], {
          duration: 0.5,
          opacity: 0,
          ease: "power3.out"
        });

        // 暂停轨道动画
        planetTween.pause();
      } else {
        //退出动画
        // 恢复原始状态
        gsap.to(planet, {
          duration: 0.8,
          scale: 1,
          x: Math.cos(planetTween.progress() * Math.PI * 2) * orbit.radius - 15,
          y: Math.sin(planetTween.progress() * Math.PI * 2) * orbit.radius - 15,
          ease: "back.out(1.2)",
          onComplete: () => {
            planetTween.resume();
          }
        });

        // 恢复其他行星、太阳和轨道
        planets.forEach(p => {
          if (p !== planet) {
            gsap.to(p, {
              duration: 0.8,
              opacity: 1,
              ease: "sine.inOut"
            });
          }
        });
        gsap.to([sun, orbitContainer], {
          duration: 0.8,
          opacity: 1,
          ease: "sine.inOut"
        });

      }

      isZoomed = !isZoomed;
    });
  });

  // 为太阳添加点击事件
  sun.addEventListener('click', () => {
    if (!isSunZoomed) {
      // 放大太阳并居中
      gsap.to(sun, {
        duration: 0.5,
        scale: 3,
        ease: "power2.out"
      });

      // 淡出行星和轨道
      planets.forEach(p => {
        gsap.to(p, {
          duration: 0.5,
          opacity: 0,
          ease: "power3.out"
        });
      });
      gsap.to(orbitContainer, {
        duration: 0.5,
        opacity: 0,
        ease: "power3.out"
      });

    } else {
      // 恢复原始状态
      gsap.to(sun, {
        duration: 0.8,
        scale: 1,
        ease: "back.out(1.2)"
      });

      // 恢复行星和轨道
      planets.forEach(p => {
        gsap.to(p, {
          duration: 0.8,
          opacity: 1,
          ease: "sine.inOut"
        });
      });
      gsap.to(orbitContainer, {
        duration: 0.8,
        opacity: 1,
        ease: "sine.inOut"
      });
    }

    isSunZoomed = !isSunZoomed;
  });
});