import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { fetchGitHubRepos } from '../utils/github'

gsap.registerPlugin(ScrollTrigger)

// Framer Motion animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" }
}

const Home = () => {
  const signaturePathRef = useRef(null)
  const signatureSvgRef = useRef(null)
  const heroTitleRef = useRef(null)
  const heroImageRef = useRef(null)
  const fadeInRefs = useRef([])
  const cardRefs = useRef([])
  const projectCardRefs = useRef([])

  // State for GitHub projects
  const [githubProjects, setGithubProjects] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(true)

  const getTagColor = (tag) => {
    const colorMap = {
      'react': 'primary',
      'javascript': 'warning',
      'typescript': 'primary',
      'html': 'warning',
      'css': 'secondary',
      'frontend': 'primary',
      'freelance': 'accent',
      'featured': 'primary',
      'vbnet': 'accent',
      'sql': 'warning',
      'fullstack': 'secondary',
      'product-owner': 'primary',
      'medical': 'accent',
      'webapp': 'secondary',
      'scrum': 'warning',
      'mobile': 'accent',
      'pharmacy': 'secondary',
      'php': 'warning',
      'graduation': 'success',
      'academic': 'success',
      'java': 'warning',
      'python': 'secondary',
      'vue': 'success',
      'angular': 'primary',
      'node': 'success',
      'express': 'accent'
    }
    return colorMap[tag.toLowerCase()] || 'accent'
  }

  // Fetch GitHub projects on component mount
  useEffect(() => {
    const loadGitHubProjects = async () => {
      setLoadingProjects(true)
      try {
        const repos = await fetchGitHubRepos(8, 'updated') // Fetch 8 most recently updated repos
        setGithubProjects(repos)
      } catch (error) {
        console.error('Failed to load GitHub projects:', error)
      } finally {
        setLoadingProjects(false)
      }
    }
    
    loadGitHubProjects()
  }, [])

  useEffect(() => {
    // Scroll to top on mount
    window.scrollTo({ top: 0, behavior: 'instant' })
    
    // Wait for scroll to complete before setting up animations
    const setupAnimations = () => {
      // GSAP Animations
      if (typeof gsap !== 'undefined') {
      // Signature Animation
      if (signaturePathRef.current && signatureSvgRef.current) {
        const pathLength = signaturePathRef.current.getTotalLength()
        signaturePathRef.current.style.strokeDasharray = pathLength
        signaturePathRef.current.style.strokeDashoffset = pathLength

        const tl = gsap.timeline({ delay: 0.3 })
        tl.to(signatureSvgRef.current, {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out"
        })
        tl.to(signaturePathRef.current, {
          strokeDashoffset: 0,
          duration: 2.5,
          ease: "power1.inOut",
          onUpdate: function() {
            const progress = this.progress()
            if (progress > 0.2 && progress < 0.6) {
              signaturePathRef.current.style.strokeWidth = "3.5"
            } else if (progress > 0.6 && progress < 0.9) {
              signaturePathRef.current.style.strokeWidth = "3.2"
            } else {
              signaturePathRef.current.style.strokeWidth = "3"
            }
          },
          onComplete: function() {
            gsap.to(signaturePathRef.current, {
              strokeWidth: "3",
              filter: "drop-shadow(0 4px 16px rgba(252, 163, 17, 0.8))",
              duration: 0.5,
              ease: "power2.out"
            })
            gsap.to(signatureSvgRef.current, {
              scale: 1.02,
              duration: 0.4,
              yoyo: true,
              repeat: 1,
              ease: "power2.inOut"
            })
          }
        })
      }
      // Fade-in elements - set initial state and animate on scroll
      // Use a single observer for all fade-in elements
      const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('visible')) {
            const index = fadeInRefs.current.indexOf(entry.target)
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: 0.3 + (index * 0.05),
              ease: "power2.out",
              onComplete: function() {
                entry.target.classList.add('visible')
              }
            })
            fadeObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.1 })

      // Filter out null/undefined and observe all fade-in elements
      const validFadeElements = fadeInRefs.current.filter(el => el !== null && el !== undefined)
      validFadeElements.forEach((el, index) => {
        // Set initial state
        gsap.set(el, { opacity: 0, y: 30 })
        fadeObserver.observe(el)
      })

      // Hero Text Animation
      if (heroTitleRef.current && !heroTitleRef.current.classList.contains('text-animated')) {
        const text = heroTitleRef.current.textContent
        heroTitleRef.current.innerHTML = text.split('').map((char, i) => 
          `<span style="display: inline-block;">${char === ' ' ? '&nbsp;' : char}</span>`
        ).join('')
        
        const chars = heroTitleRef.current.querySelectorAll('span')
        // Ensure chars are visible by default
        chars.forEach(char => {
          char.style.opacity = '1'
          char.style.transform = 'translateY(0) rotateX(0deg)'
        })
        
        gsap.fromTo(chars,
          { opacity: 0, y: 50, rotationX: -90 },
          {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.03,
            ease: "back.out(1.7)",
            delay: 0.3,
            onComplete: function() {
              heroTitleRef.current.classList.add('text-animated')
            }
          }
        )
      }

      // Hero Image Parallax & 3D Tilt
      if (heroImageRef.current) {
        const imageContainer = heroImageRef.current.closest('.relative')
        if (imageContainer && window.innerWidth > 768) {
          gsap.to(heroImageRef.current, {
            y: -80,
            scrollTrigger: {
              trigger: imageContainer,
              start: "top bottom",
              end: "bottom top",
              scrub: 1
            }
          })

          const handleMouseMove = (e) => {
            const rect = imageContainer.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const centerX = rect.width / 2
            const centerY = rect.height / 2
            const rotateX = (y - centerY) / 15
            const rotateY = (centerX - x) / 15
            
            gsap.to(heroImageRef.current, {
              rotationX: rotateX,
              rotationY: rotateY,
              transformPerspective: 1000,
              duration: 0.3,
              ease: "power2.out"
            })
          }

          const handleMouseLeave = () => {
            gsap.to(heroImageRef.current, {
              rotationX: 0,
              rotationY: 0,
              duration: 0.5,
              ease: "power2.out"
            })
          }

          imageContainer.addEventListener('mousemove', handleMouseMove)
          imageContainer.addEventListener('mouseleave', handleMouseLeave)

          return () => {
            imageContainer.removeEventListener('mousemove', handleMouseMove)
            imageContainer.removeEventListener('mouseleave', handleMouseLeave)
          }
        }
      }

      // Button hover effects
      const buttons = document.querySelectorAll('.btn-primary, .btn-secondary')
      buttons.forEach(button => {
        const handleMouseEnter = () => {
          gsap.to(button, {
            scale: 1.05,
            y: -2,
            duration: 0.2,
            ease: "power2.out"
          })
        }
        const handleMouseLeave = () => {
          gsap.to(button, {
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "power2.out"
          })
        }
        button.addEventListener('mouseenter', handleMouseEnter)
        button.addEventListener('mouseleave', handleMouseLeave)
      })

      // Card animations - observe all cards on the page
      const allCards = document.querySelectorAll('.card')
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !entry.target.classList.contains('gsap-animated')) {
            gsap.fromTo(entry.target,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                onComplete: function() {
                  entry.target.classList.add('gsap-animated')
                }
              }
            )
            cardObserver.unobserve(entry.target)
          }
        })
      }, { threshold: 0.1 })

      // Set initial state for all cards and observe them
      allCards.forEach(card => {
        if (card) {
          gsap.set(card, { opacity: 0, y: 30 })
          
          const handleMouseEnter = () => {
            gsap.to(card, {
              y: -4,
              scale: 1.02,
              duration: 0.2,
              ease: "power2.out"
            })
          }
          const handleMouseLeave = () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.2,
              ease: "power2.out"
            })
          }
          card.addEventListener('mouseenter', handleMouseEnter)
          card.addEventListener('mouseleave', handleMouseLeave)
          cardObserver.observe(card)
        }
      })

      // Also observe cards from refs
      cardRefs.current.forEach(card => {
        if (card && !card.classList.contains('gsap-animated')) {
          gsap.set(card, { opacity: 0, y: 30 })
          cardObserver.observe(card)
        }
      })

      // Observe project cards
      projectCardRefs.current.forEach(card => {
        if (card && !card.classList.contains('gsap-animated') && !card.classList.contains('animating')) {
          card.classList.add('gsap-initialized')
          gsap.set(card, { opacity: 0, y: 30, immediateRender: true })
          cardObserver.observe(card)
        }
      })

      // Section title animations
      const sectionTitles = document.querySelectorAll('section h3:not(header h3), section h2:not(header h2)')
      sectionTitles.forEach((title) => {
        // Ensure titles are visible by default
        title.style.opacity = '1'
        title.style.transform = 'translateY(0)'
        
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('title-animated')) {
              gsap.fromTo(entry.target,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power2.out",
                  onComplete: function() {
                    entry.target.classList.add('title-animated')
                  }
                }
              )
              observer.unobserve(entry.target)
            }
          })
        }, { threshold: 0.1 })
        observer.observe(title)
      })
      
      // Force check for elements already in viewport
      requestAnimationFrame(() => {
        const validFadeElements = fadeInRefs.current.filter(el => el !== null && el !== undefined)
        validFadeElements.forEach((el) => {
          const rect = el.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0
          if (isVisible && !el.classList.contains('visible')) {
            const index = fadeInRefs.current.indexOf(el)
            gsap.to(el, {
              opacity: 1,
              y: 0,
              duration: 0.8,
              delay: 0.3 + (index * 0.05),
              ease: "power2.out",
              onComplete: function() {
                el.classList.add('visible')
              }
            })
            fadeObserver.unobserve(el)
          }
        })
        
        allCards.forEach(card => {
          const rect = card.getBoundingClientRect()
          const isVisible = rect.top < window.innerHeight && rect.bottom > 0
          if (isVisible && !card.classList.contains('gsap-animated')) {
            gsap.fromTo(card,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power2.out",
                onComplete: function() {
                  card.classList.add('gsap-animated')
                }
              }
            )
            cardObserver.unobserve(card)
          }
        })
      })
      } // Close if (typeof gsap !== 'undefined')
    } // Close setupAnimations

    // Ensure fade-in elements are visible after animation (fallback)
    setTimeout(() => {
      fadeInRefs.current.forEach((el) => {
        if (el && el.classList.contains('visible')) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      })
    }, 300)
    
    // Setup animations after scroll completes
    requestAnimationFrame(() => {
      requestAnimationFrame(setupAnimations)
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Hero Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div 
                className="fade-in" 
                ref={el => fadeInRefs.current[0] = el}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Hi, I'm <span className="text-gradient" ref={heroTitleRef}>Ali Youssef</span>
                </motion.h1>
                <motion.h2 
                  className="text-xl sm:text-2xl lg:text-3xl text-text-secondary mb-8 font-medium"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  Frontend React Developer
                </motion.h2>
                <motion.p 
                  className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  Highly motivated and experienced Front-end React Developer seeking to build scalable and fast web applications, combined with AI tools like Vibe Coding to enhance user experience.
                </motion.p>
                {/* Signature */}
                <div className="signature-wrapper mt-2 mb-6 flex justify-center lg:justify-start" id="signature-wrapper">
                  <svg ref={signatureSvgRef} id="signature-svg" className="signature-svg signature-hero" viewBox="0 0 1066 481" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      ref={signaturePathRef}
                      id="signature-path"
                      d="M202.166 438.282L257.166 379.782L313.166 313.782C329.5 293.115 366.066 249.282 381.666 239.282C401.166 226.782 404.666 213.782 476.666 160.782C534.266 118.382 546 118.449 544.666 123.782C546.833 124.782 538.466 143.081 487.666 208.281C436.866 273.481 412.166 307.115 406.166 315.781L354.666 379.782M988.166 152.781C906.166 166.448 719.066 200.081 626.666 225.281C534.266 250.481 199.833 348.115 44.1662 393.781C31.3329 397.448 4.66619 403.881 0.666193 400.281C-4.33381 395.781 104.166 338.281 190.166 315.281C258.966 296.881 282.833 291.281 286.166 290.781C288.999 288.948 317.366 287.781 408.166 297.781C498.966 307.781 466.999 352.948 439.666 374.281L626.666 118.281M471.666 480.281C554.666 343.781 729.166 63.0812 763.166 32.2812M622.666 290.781C629.833 280.615 648.766 259.081 667.166 254.281C690.166 248.281 637.666 272.281 647.666 285.281C657.666 298.281 694.166 245.781 703.166 248.281C712.166 250.781 685.666 256.281 682.666 282.281C682.666 285.281 687.066 285.281 688.666 285.281C690.666 285.281 734.666 244.781 741.166 245.781C747.666 246.781 712.666 269.281 725.666 270.281C736.066 271.081 747.666 261.281 752.166 256.281M783.166 232.781C776.666 238.615 763.766 254.281 764.166 270.281C764.666 290.281 733.166 293.281 737.166 287.781C741.166 282.281 793.166 257.281 796.666 252.781C800.166 248.281 814.666 243.781 815.166 230.781C815.666 217.781 780.166 265.781 796.666 257.781C813.166 249.781 828.166 247.281 835.666 234.281C843.166 221.281 825.666 241.429 826.666 242.281C827.666 243.133 820.666 255.281 831.666 249.781C842.666 244.281 872.666 229.281 879.166 220.281C885.666 211.281 872.7 216.281 866.666 225.281C860.632 234.281 860.166 240.281 864.166 242.281C867.366 243.881 886.833 230.281 896.166 223.281M1065.17 0.28125C998.166 98.2812 865.666 295.981 871.666 302.781M554.166 274.281L515.166 330.281M598.166 385.281C627.499 371.448 711.966 339.681 815.166 323.281"
                      stroke="#FCA311"
                      strokeWidth="30"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      shapeRendering="crispEdges"
                    />
                  </svg>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/contact" className="btn-secondary inline-flex items-center justify-center">
                    Get In Touch
                    <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </Link>
                </div>
              </motion.div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 max-w-md lg:max-w-lg">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-3xl opacity-20 animate-pulse"></div>
                <img 
                  ref={heroImageRef}
                  src="/alideveloper.PNG" 
                  alt="Ali Youssef - Frontend Developer" 
                  className="relative z-10 w-full h-auto rounded-2xl shadow-custom-xl object-cover aspect-square" 
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                    e.target.onerror = null
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brief Introduction */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 section-bg-custom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h3 
            className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 fade-in" 
            ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
            {...fadeInUp}
            viewport={{ once: true }}
          >
            Crafting Digital Experiences
          </motion.h3>
          <motion.p 
            className="text-lg text-text-secondary leading-relaxed fade-in" 
            ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
            {...fadeInUp}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            With experience in frontend development and product ownership, I specialize in creating 
            responsive, accessible, and performant web applications. I'm passionate about 
            modern web technologies and always eager to learn new tools and frameworks.
          </motion.p>
        </div>
      </motion.section>

      {/* Featured Skills */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 core-technologies-section">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 fade-in" ref={el => fadeInRefs.current[3] = el}>
              Core Technologies
            </h3>
            <p className="text-lg text-text-secondary fade-in" ref={el => fadeInRefs.current[4] = el}>
              Technologies I work with to bring ideas to life
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* React */}
            <motion.div 
              className="card p-6 text-center transition-transform duration-200" 
              ref={el => cardRefs.current[0] = el}
              variants={fadeInUp}
              whileHover={cardHover}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-xl flex items-center justify-center">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">React</h4>
              <p className="text-sm text-text-secondary">Component-based UI library</p>
            </motion.div>

            {/* JavaScript */}
            <motion.div 
              className="card p-6 text-center transition-transform duration-200" 
              ref={el => cardRefs.current[1] = el}
              variants={fadeInUp}
              whileHover={cardHover}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-warning/10 rounded-xl flex items-center justify-center">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" alt="JavaScript" className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">JavaScript</h4>
              <p className="text-sm text-text-secondary">Modern ES6+ development</p>
            </motion.div>

            {/* CSS3 */}
            <motion.div 
              className="card p-6 text-center transition-transform duration-200" 
              ref={el => cardRefs.current[2] = el}
              variants={fadeInUp}
              whileHover={cardHover}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-xl flex items-center justify-center">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" alt="CSS3" className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">CSS3</h4>
              <p className="text-sm text-text-secondary">Advanced styling & animations</p>
            </motion.div>

            {/* Tailwind CSS */}
            <motion.div 
              className="card p-6 text-center transition-transform duration-200" 
              ref={el => cardRefs.current[3] = el}
              variants={fadeInUp}
              whileHover={cardHover}
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-accent/10 rounded-xl flex items-center justify-center">
                <img src="https://api.iconify.design/devicon:tailwindcss.svg" alt="Tailwind CSS" className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-semibold text-text-primary mb-2">Tailwind</h4>
              <p className="text-sm text-text-secondary">Utility-first CSS framework</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-primary/20">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h3 
              className="text-2xl sm:text-3xl font-bold text-text-primary mb-4 fade-in" 
              ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
            >
              My Projects
            </h3>
            <p 
              className="text-lg text-text-secondary fade-in" 
              ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
            >
              Check out my latest work on GitHub
            </p>
          </div>

          {loadingProjects ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-text-secondary mt-4">Loading projects from GitHub...</p>
            </div>
          ) : githubProjects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-secondary">No projects found. Please check your GitHub username in config.js</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {githubProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  className="project-card card overflow-hidden group"
                  ref={el => projectCardRefs.current[index] = el}
                  variants={fadeInUp}
                  whileHover={cardHover}
                >
                  <div className="relative overflow-hidden">
                    <div className="aspect-video overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-200 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
                          e.target.onerror = null
                        }}
                      />
                    </div>
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
                    {project.stars > 0 && (
                      <div className="absolute top-3 right-3 bg-primary/90 text-white px-2 py-1 rounded-full text-xs md:text-xs font-medium z-10 flex items-center gap-1">
                        <svg className="w-3 h-3 md:w-3 md:h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {project.stars}
                      </div>
                    )}
                    {project.featured && (
                      <div className="absolute top-3 left-3 bg-primary text-white px-2 py-1 rounded-full text-xs md:text-xs font-medium z-10">
                        Featured
                      </div>
                    )}
                  </div>
                  <div className="p-6 sm:p-6 md:p-6">
                    <h4 className="text-xl sm:text-xl md:text-xl font-semibold text-text-primary mb-3 sm:mb-2">{project.title}</h4>
                    <p className="text-base sm:text-sm md:text-sm text-text-secondary mb-4 line-clamp-2">
                      {project.shortDescription}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 4).map((tag, tagIndex) => {
                        const tagColor = getTagColor(tag)
                        const tagClasses = {
                          'primary': 'bg-primary/10 text-primary',
                          'secondary': 'bg-secondary/10 text-secondary',
                          'accent': 'bg-accent/10 text-accent',
                          'warning': 'bg-warning/10 text-warning',
                          'success': 'bg-green-500/10 text-green-500'
                        }
                        return (
                          <span key={`${project.id}-${tag}-${tagIndex}`} className={`px-3 sm:px-3 md:px-3 py-1.5 sm:py-1 md:py-1 ${tagClasses[tagColor] || 'bg-text-secondary/10 text-text-secondary'} text-xs sm:text-xs md:text-xs rounded-full`}>
                            {tag}
                          </span>
                        )
                      })}
                    </div>
                    <div className="flex gap-3 sm:gap-2 md:gap-2 flex-nowrap">
                      {project.liveUrl ? (
                        <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex-1 btn-primary text-center text-base sm:text-sm md:text-sm py-3 sm:py-2.5 md:py-2.5 inline-flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0">
                          <svg className="w-5 h-5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          <span className="truncate">Live Demo</span>
                        </a>
                      ) : null}
                      <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className={`${project.liveUrl ? 'flex-1' : 'w-full'} btn-secondary text-center text-base sm:text-sm md:text-sm py-3 sm:py-2.5 md:py-2.5 inline-flex items-center justify-center gap-1.5 whitespace-nowrap min-w-0`}>
                        <svg className="w-5 h-5 sm:w-4 sm:h-4 md:w-4 md:h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        <span className="truncate">View Code</span>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 lets-work-together-section">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h3 
            className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 fade-in" 
            ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
          >
            Let's Work Together
          </h3>
          <p 
            className="text-lg text-text-secondary mb-8 fade-in" 
            ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
          >
            I'm always interested in new opportunities and exciting projects. 
            Let's discuss how we can bring your ideas to life.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-12 sm:gap-8 justify-center mb-8 fade-in" ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/contact" className="btn-primary">
                Get In Touch
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <a href="mailto:contact@aliyoussef.tech" className="btn-secondary">
                Send Email
              </a>
            </motion.div>
          </div>

          {/* Social Links */}
          <div 
            className="flex justify-center space-x-6 fade-in" 
            ref={el => { if (el && !fadeInRefs.current.includes(el)) fadeInRefs.current.push(el) }}
          >
            <motion.a 
              href="https://github.com/Ali-ysf-dev" 
              className="text-text-secondary hover:text-primary transition-colors duration-200" 
              aria-label="GitHub"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </motion.a>
            <motion.a 
              href="https://www.linkedin.com/in/ali-youssef-a49535346/" 
              className="text-text-secondary hover:text-primary transition-colors duration-200" 
              aria-label="LinkedIn"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </motion.a>
            <motion.a 
              href="https://twitter.com/aliyoussef" 
              className="text-text-secondary hover:text-primary transition-colors duration-200" 
              aria-label="Twitter"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
            </motion.a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home

