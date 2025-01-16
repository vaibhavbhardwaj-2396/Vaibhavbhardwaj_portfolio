import React, { useEffect, useState } from 'react';

export const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [trailPosition, setTrailPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we're on the admin page
    if (document.body.classList.contains('admin-page')) {
      return;
    }

    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setTimeout(() => {
        setTrailPosition({ x: e.clientX, y: e.clientY });
      }, 25);
      setIsVisible(true);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, .block-card, .social-bubble')) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = () => {
      setIsHovering(false);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Don't render cursor on admin page
  if (document.body.classList.contains('admin-page')) {
    return null;
  }

  return (
    <>
      <div
        className={`custom-cursor ${isHovering ? 'scale-150' : ''}`}
        style={{
          transform: `translate(${position.x - 16}px, ${position.y - 16}px)`,
          opacity: isVisible ? 1 : 0,
        }}
      />
      <div
        className="custom-cursor-trail"
        style={{
          transform: `translate(${trailPosition.x - 8}px, ${trailPosition.y - 8}px)`,
          opacity: isVisible ? 0.6 : 0,
        }}
      />
    </>
  );
};