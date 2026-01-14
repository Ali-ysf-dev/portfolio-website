import { useLayoutEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete
}) => {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);
  const initialCardPositionsRef = useRef(new Map());
  const sectionContainerRef = useRef(null);
  const cardStackPositionsRef = useRef(new Map()); // Store locked stack position for each card
  const cardStackEntryScrollRef = useRef(new Map()); // Store scrollTop when card entered stack

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
        scrollContainer: document.documentElement
      };
    } else {
      const scroller = scrollerRef.current;
      return {
        scrollTop: scroller.scrollTop,
        containerHeight: scroller.clientHeight,
        scrollContainer: scroller
      };
    }
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element, index) => {
      if (useWindowScroll) {
        // Use cached initial position if available
        if (index !== undefined && initialCardPositionsRef.current.has(index)) {
          return initialCardPositionsRef.current.get(index);
        }
        // Fallback: calculate position (shouldn't happen if initialized correctly)
        const rect = element.getBoundingClientRect();
        const initialPosition = rect.top + window.scrollY;
        if (index !== undefined) {
          initialCardPositionsRef.current.set(index, initialPosition);
        }
        return initialPosition;
      } else {
        return element.offsetTop;
      }
    },
    [useWindowScroll]
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = useWindowScroll
      ? document.querySelector('.scroll-stack-end')
      : scrollerRef.current?.querySelector('.scroll-stack-end');

    let endElementTop = 0;
    if (endElement) {
      if (useWindowScroll) {
        const rect = endElement.getBoundingClientRect();
        endElementTop = rect.top + window.scrollY;
      } else {
        endElementTop = endElement.offsetTop;
      }
    }

    // Ensure section container is cached
    if (!sectionContainerRef.current && cardsRef.current.length > 0) {
      const firstCard = cardsRef.current[0];
      if (firstCard) {
        sectionContainerRef.current = useWindowScroll 
          ? firstCard.closest('section') || scrollerRef.current?.closest('section') || document.body
          : scrollerRef.current;
      }
    }

    // Calculate section bounds once
    let sectionTop = 0;
    let sectionBottom = Infinity;
    if (sectionContainerRef.current) {
      if (useWindowScroll) {
        const sectionRect = sectionContainerRef.current.getBoundingClientRect();
        sectionTop = sectionRect.top + window.scrollY;
        sectionBottom = sectionTop + sectionRect.height;
      } else {
        sectionTop = sectionContainerRef.current.offsetTop;
        sectionBottom = sectionTop + sectionContainerRef.current.offsetHeight;
      }
    }

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card, i);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      
      // Pin end should be when we reach near the bottom of the section
      // Use the section bottom or end element, whichever comes first
      const calculatedPinEnd = sectionContainerRef.current 
        ? Math.min(sectionBottom - containerHeight * 0.5, endElementTop - containerHeight / 2)
        : endElementTop - containerHeight / 2;
      const pinEnd = Math.max(pinStart, calculatedPinEnd);

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = getElementOffset(cardsRef.current[j], j);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          const depthInStack = topCardIndex - i;
          blur = Math.max(0, depthInStack * blurAmount);
        }
      }

      // Check if this card has reached its pin start (should enter stack)
      const hasReachedPinStart = scrollTop >= pinStart;
      
      // When card first enters stack, lock its position and store entry scroll position
      if (hasReachedPinStart && !cardStackPositionsRef.current.has(i)) {
        // Count how many cards are already in the stack (have lower indices and are locked)
        let stackPosition = 0;
        for (let j = 0; j < i; j++) {
          if (cardStackPositionsRef.current.has(j)) {
            stackPosition++;
          }
        }
        // Lock this card's position in the stack
        cardStackPositionsRef.current.set(i, stackPosition);
        // Store the scroll position when this card entered
        cardStackEntryScrollRef.current.set(i, scrollTop);
      }
      
      // Clear locked position if we scroll back before pinStart
      if (scrollTop < pinStart && cardStackPositionsRef.current.has(i)) {
        cardStackPositionsRef.current.delete(i);
        cardStackEntryScrollRef.current.delete(i);
      }
      
      // Check if this card is in the stack
      const isInStack = cardStackPositionsRef.current.has(i);
      const positionInStack = isInStack ? cardStackPositionsRef.current.get(i) : null;
      
      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        if (isInStack && positionInStack !== null) {
          // Card is in the stack: maintain fixed viewport position
          // Target viewport Y position for this card
          const targetViewportY = stackPositionPx + (positionInStack * itemStackDistance);
          
          // Calculate translateY to keep card at target viewport position
          // Formula: translateY = targetViewportY - (cardTop - scrollTop)
          // This ensures the card stays at the same viewport position as we scroll
          translateY = targetViewportY - cardTop + scrollTop;
        } else {
          // Card is approaching stack but not yet locked
          // Count how many cards will be in stack when this one joins
          let futureStackDepth = 0;
          for (let j = 0; j < i; j++) {
            const jCardTop = getElementOffset(cardsRef.current[j], j);
            const jPinStart = jCardTop - stackPositionPx - itemStackDistance * j;
            if (scrollTop >= jPinStart) {
              futureStackDepth++;
            }
          }
          const targetViewportY = stackPositionPx + (futureStackDepth * itemStackDistance);
          translateY = targetViewportY - cardTop + scrollTop;
        }
      } else if (scrollTop > pinEnd) {
        // When past pin end, maintain final stacked position
        if (isInStack && positionInStack !== null) {
          const targetViewportY = stackPositionPx + (positionInStack * itemStackDistance);
          translateY = targetViewportY - cardTop + pinEnd;
        } else {
          let futureStackDepth = 0;
          for (let j = 0; j < i; j++) {
            const jCardTop = getElementOffset(cardsRef.current[j], j);
            const jPinStart = jCardTop - stackPositionPx - itemStackDistance * j;
            if (pinEnd >= jPinStart) {
              futureStackDepth++;
            }
          }
          const targetViewportY = stackPositionPx + (futureStackDepth * itemStackDistance);
          translateY = targetViewportY - cardTop + pinEnd;
        }
      } else if (scrollTop < pinStart) {
        // Before pinning starts, no translation
        translateY = 0;
      }
      
      // Ensure cards don't go off-screen
      const maxTranslateY = containerHeight * 2; // Reasonable max
      const minTranslateY = -containerHeight; // Reasonable min
      translateY = Math.max(minTranslateY, Math.min(maxTranslateY, translateY));

      const newTransform = {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100
      };

      const lastTransform = lastTransformsRef.current.get(i);
      const hasChanged =
        !lastTransform ||
        Math.abs(lastTransform.translateY - newTransform.translateY) > 0.1 ||
        Math.abs(lastTransform.scale - newTransform.scale) > 0.001 ||
        Math.abs(lastTransform.rotation - newTransform.rotation) > 0.1 ||
        Math.abs(lastTransform.blur - newTransform.blur) > 0.1;

      if (hasChanged) {
        const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
        const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';

        card.style.transform = transform;
        card.style.filter = filter;

        lastTransformsRef.current.set(i, newTransform);
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075
      });

      lenis.on('scroll', handleScroll);

      const raf = time => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    } else {
      const scroller = scrollerRef.current;
      if (!scroller) return;

      const lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector('.scroll-stack-inner'),
        duration: 1.2,
        easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        infinite: false,
        gestureOrientationHandler: true,
        normalizeWheel: true,
        wheelMultiplier: 1,
        touchInertiaMultiplier: 35,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
        touchInertia: 0.6
      });

      lenis.on('scroll', handleScroll);

      const raf = time => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    }
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? document.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    );

    cardsRef.current = cards;
    const transformsCache = lastTransformsRef.current;

    // Clear initial positions cache when cards change
    initialCardPositionsRef.current.clear();
    cardStackPositionsRef.current.clear();
    cardStackEntryScrollRef.current.clear();
    sectionContainerRef.current = null;
    
    // Find section container once
    if (useWindowScroll && cards.length > 0 && cards[0]) {
      sectionContainerRef.current = cards[0].closest('section') || 
                                    scrollerRef.current?.closest('section') || 
                                    document.body;
    } else {
      sectionContainerRef.current = scrollerRef.current;
    }
    
    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
      
      // Cache initial position for window scroll mode
      if (useWindowScroll && card) {
        const rect = card.getBoundingClientRect();
        const initialPosition = rect.top + window.scrollY;
        initialCardPositionsRef.current.set(i, initialPosition);
      }
    });

    setupLenis();

    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      transformsCache.clear();
      initialCardPositionsRef.current.clear();
      cardStackPositionsRef.current.clear();
      cardStackEntryScrollRef.current.clear();
      sectionContainerRef.current = null;
      isUpdatingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    setupLenis,
    updateCardTransforms
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        {/* Spacer so the last pin can release cleanly */}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
