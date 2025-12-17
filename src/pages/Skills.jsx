import { useEffect, useState, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'

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
      staggerChildren: 0.05
    }
  }
}

const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.2, ease: "easeOut" }
}

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const cardRefs = useRef([])
  const progressBarRefs = useRef([])
  const fadeInRefs = useRef([])

  const skills = {
    frontend: [
      { name: 'React', proficiency: 90, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', tags: ['Hooks', 'JSX', 'State Management'], color: 'primary' },
      { name: 'HTML', proficiency: 95, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg', tags: ['Semantic HTML', 'Accessibility', 'Forms'], color: 'primary' },
      { name: 'CSS3', proficiency: 92, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg', tags: ['Flexbox', 'Grid', 'Animations'], color: 'primary' },
      { name: 'JavaScript', proficiency: 88, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', tags: ['ES6+', 'DOM', 'APIs'], color: 'warning' },
      { name: 'Tailwind CSS', proficiency: 85, experience: 1, icon: 'https://api.iconify.design/devicon:tailwindcss.svg', tags: ['Utilities', 'Components', 'Responsive'], color: 'accent' },
      { name: 'Bootstrap', proficiency: 80, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg', tags: ['Grid System', 'Components', 'Responsive'], color: 'secondary' },
    ],
    backend: [
      { name: 'Python', proficiency: 75, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', tags: ['FastAPI', 'Django', 'APIs'], color: 'success' },
      { name: 'Node.js', proficiency: 70, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg', tags: ['Express.js', 'NPM', 'APIs'], color: 'success' },
      { name: 'MySQL', proficiency: 80, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg', tags: ['Queries', 'Schema Design', 'Optimization'], color: 'secondary' },
      { name: 'SQL', proficiency: 85, experience: 2, icon: null, tags: ['Complex Queries', 'Joins', 'Stored Procedures'], color: 'secondary' },
      { name: 'PHP', proficiency: 75, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg', tags: ['MVC', 'APIs', 'Frameworks'], color: 'warning' },
      { name: 'FastAPI', proficiency: 70, experience: 1, icon: null, tags: ['REST APIs', 'Async', 'OpenAPI'], color: 'success' },
      { name: 'PostgreSQL', proficiency: 65, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg', tags: ['ACID', 'JSON', 'Performance'], color: 'accent' },
      { name: 'MongoDB', proficiency: 60, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg', tags: ['Documents', 'Aggregation', 'Atlas'], color: 'warning' },
    ],
    tools: [
      { name: 'JIRA', proficiency: 85, experience: 1, icon: null, tags: ['Scrum', 'Kanban', 'Reporting'], color: 'primary' },
      { name: 'VS Code', proficiency: 90, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg', tags: ['Extensions', 'Debugging', 'IntelliSense'], color: 'primary' },
      { name: 'Visual Studio', proficiency: 75, experience: 1, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg', tags: ['Debugging', 'NuGet', '.NET'], color: 'secondary' },
      { name: 'Git', proficiency: 85, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg', tags: ['Branching', 'Merging', 'Workflows'], color: 'accent' },
      { name: 'GitHub', proficiency: 85, experience: 2, icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg', tags: ['Pull Requests', 'Issues', 'Actions'], color: 'primary' },
      { name: 'Postman', proficiency: 80, experience: 1, icon: null, tags: ['API Testing', 'Collections', 'Environment'], color: 'warning' },
      { name: 'XAMPP', proficiency: 75, experience: 1, icon: null, tags: ['Apache', 'MySQL', 'PHP'], color: 'accent' },
    ],
    soft: [
      { name: 'Problem Solving', proficiency: 90, experience: 2, icon: null, tags: [], color: 'primary' },
      { name: 'Communication', proficiency: 85, experience: 2, icon: null, tags: [], color: 'secondary' },
      { name: 'Time Management', proficiency: 88, experience: 2, icon: null, tags: [], color: 'accent' },
      { name: 'Adaptability', proficiency: 92, experience: 2, icon: null, tags: [], color: 'warning' },
      { name: 'Leadership', proficiency: 80, experience: 1, icon: null, tags: [], color: 'success' },
    ]
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    
    // Wait for scroll to complete before setting up animations
    const setupAnimations = () => {
      // Fallback to ensure content is visible if animations don't trigger
      setTimeout(() => {
      fadeInRefs.current.forEach((el) => {
        if (el && !el.classList.contains('visible')) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      })
      cardRefs.current.forEach((card) => {
        if (card && !card.classList.contains('gsap-animated')) {
          card.style.opacity = '1'
          card.style.transform = 'translateY(0)'
        }
      })
    }, 300)

    if (typeof gsap !== 'undefined') {
      // Fade-in animations with IntersectionObserver
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

      fadeInRefs.current.forEach((el) => {
        if (el) {
          gsap.set(el, { opacity: 0, y: 30 })
          fadeObserver.observe(el)
        }
      })

      // Card animations
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

      cardRefs.current.forEach(card => {
        if (card) {
          // Set initial state for scroll animation
          gsap.set(card, { opacity: 0, y: 30 })
          
          const handleMouseEnter = () => {
            gsap.to(card, {
              y: -4,
              scale: 1.02,
              duration: 0.2,
              ease: "power2.out"
            })
            
            const icon = card.querySelector('img, svg')
            if (icon) {
              gsap.to(icon, {
                scale: 1.1,
                rotation: 5,
                duration: 0.2,
                ease: "power2.out"
              })
            }
          }
          const handleMouseLeave = () => {
            gsap.to(card, {
              y: 0,
              scale: 1,
              duration: 0.2,
              ease: "power2.out"
            })
            
            const icon = card.querySelector('img, svg')
            if (icon) {
              gsap.to(icon, {
                scale: 1,
                rotation: 0,
                duration: 0.2,
                ease: "power2.out"
              })
            }
          }
          card.addEventListener('mouseenter', handleMouseEnter)
          card.addEventListener('mouseleave', handleMouseLeave)
          cardObserver.observe(card)
        }
      })

      // Progress bar animation
      const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            progressBarRefs.current.forEach(bar => {
              if (bar && bar.dataset.width) {
                setTimeout(() => {
                  bar.style.width = bar.dataset.width + '%'
                  bar.style.transition = 'width 1s ease-out'
                }, 300)
              }
            })
          }
        })
      }, { threshold: 0.5 })

      document.querySelectorAll('.skill-card, .card').forEach(card => {
        progressObserver.observe(card)
      })
      
      // Force check for elements already in viewport
      requestAnimationFrame(() => {
        fadeInRefs.current.forEach((el) => {
          if (el) {
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
          }
        })
        
        cardRefs.current.forEach((card) => {
          if (card) {
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
          }
        })
      })
      } // Close if (typeof gsap !== 'undefined')
    } // Close setupAnimations
    
    // Setup animations after scroll completes
    requestAnimationFrame(() => {
      requestAnimationFrame(setupAnimations)
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  const filteredSkills = () => {
    let result = []
    
    if (activeCategory === 'all') {
      Object.values(skills).forEach(category => {
        result = result.concat(category)
      })
    } else {
      result = skills[activeCategory] || []
    }

    // Filter by search
    if (searchTerm) {
      result = result.filter(skill => 
        skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Sort
    result.sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'proficiency':
          return b.proficiency - a.proficiency
        case 'experience':
          return b.experience - a.experience
        default:
          return 0
      }
    })

    return result
  }

  const SkillCard = ({ skill, index }) => {
    const cardRef = useRef(null)
    const barRef = useRef(null)

    useEffect(() => {
      if (cardRef.current) {
        cardRefs.current[index] = cardRef.current
      }
      if (barRef.current) {
        progressBarRefs.current[index] = barRef.current
        barRef.current.style.width = '0%'
      }
    }, [index])

    return (
      <motion.div 
        className="skill-card card p-6" 
        data-skill={skill.name.toLowerCase()} 
        data-proficiency={skill.proficiency} 
        data-experience={skill.experience}
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        whileHover={cardHover}
        transition={{ duration: 0.6, delay: index * 0.05 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            {skill.icon ? (
              <img src={skill.icon} alt={skill.name} className="w-8 h-8 mr-3" />
            ) : (
              <div className="w-8 h-8 mr-3 bg-primary/10 rounded"></div>
            )}
            <h3 className="text-lg font-semibold text-text-primary">{skill.name}</h3>
          </div>
          <span className={`px-2 py-1 bg-${skill.color}/10 text-${skill.color} text-xs rounded-full`}>
            {skill.experience}+ {skill.experience === 1 ? 'year' : 'years'}
          </span>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">Proficiency</span>
            <span className="text-text-primary font-medium">{skill.proficiency}%</span>
          </div>
          <div className="w-full bg-surface-hover rounded-full h-2">
            <div 
              className={`bg-${skill.color} h-2 rounded-full progress-bar`}
              ref={barRef}
              data-width={skill.proficiency}
              style={{width: '0%'}}
            ></div>
          </div>
        </div>
        <p className="text-sm text-text-secondary">{skill.name} description</p>
        {skill.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {skill.tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">{tag}</span>
            ))}
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="skills-page-background">
      {/* Page Header */}
      <motion.section 
        className="py-16 px-4 sm:px-6 lg:px-8 section-bg-custom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            className="fade-in" 
            ref={el => fadeInRefs.current[0] = el}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-6">
              Skills & <span className="text-gradient">Expertise</span>
            </h1>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed">
              A comprehensive overview of my technical competencies, tools, and professional capabilities 
              developed through years of frontend development experience.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Skills Filter & Search */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="text"
                id="skill-search"
                placeholder="Search skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {['all', 'frontend', 'backend', 'tools', 'soft'].map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`skill-filter-btn px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    activeCategory === category 
                      ? 'bg-primary text-white' 
                      : 'bg-surface text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {category === 'all' ? 'All Skills' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-text-secondary">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-surface text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="name">Name</option>
                <option value="proficiency">Proficiency</option>
                <option value="experience">Experience</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Skills Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {(activeCategory === 'all' || activeCategory === 'frontend') && (
            <div className="skill-category mb-16" data-category="frontend">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Frontend Technologies</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skills.frontend
                  .filter(skill => !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((skill, index) => (
                    <SkillCard key={skill.name} skill={skill} index={index} />
                  ))}
              </div>
            </div>
          )}

          {(activeCategory === 'all' || activeCategory === 'backend') && (
            <div className="skill-category mb-16" data-category="backend">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Backend Knowledge</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skills.backend
                  .filter(skill => !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((skill, index) => (
                    <SkillCard key={skill.name} skill={skill} index={skills.frontend.length + index} />
                  ))}
              </div>
            </div>
          )}

          {(activeCategory === 'all' || activeCategory === 'tools') && (
            <div className="skill-category mb-16" data-category="tools">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Tools & Workflow</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skills.tools
                  .filter(skill => !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((skill, index) => (
                    <SkillCard key={skill.name} skill={skill} index={skills.frontend.length + skills.backend.length + index} />
                  ))}
              </div>
            </div>
          )}

          {(activeCategory === 'all' || activeCategory === 'soft') && (
            <div className="skill-category mb-16" data-category="soft">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-warning/10 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-text-primary">Soft Skills</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {skills.soft
                  .filter(skill => !searchTerm || skill.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((skill, index) => (
                    <SkillCard key={skill.name} skill={skill} index={skills.frontend.length + skills.backend.length + skills.tools.length + index} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Skills Export */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
            Skills Summary
          </h2>
          <p className="text-lg text-text-secondary mb-8">
            Download a comprehensive overview of my technical skills and experience for your review.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => alert('PDF export functionality would be implemented here. This would generate a comprehensive skills summary document.')}
              className="btn-primary inline-flex items-center justify-center"
            >
              <svg className="mr-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Download Skills PDF
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Skills

