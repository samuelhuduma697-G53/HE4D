import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Card } from '../components/common/Card'

export const SuccessStoriesPage = () => {
  const [stories, setStories] = useState([])
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    fetch('/api/public/success-stories')
      .then(r => r.json())
      .then(d => setStories(d.stories || []))
      .catch(() => {})
  }, [])

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (stories.length <= 1) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % stories.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [stories.length])

  if (stories.length === 0) {
    return (
      <>
        <Helmet><title>Success Stories | Huduma Ecosystem</title></Helmet>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Success Stories</h1>
          <p className="text-gray-400">No stories yet. Be the first to share your experience!</p>
        </div>
      </>
    )
  }

  const story = stories[current]

  return (
    <>
      <Helmet><title>Success Stories | Huduma Ecosystem</title></Helmet>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">Success Stories</h1>

        {/* Slider */}
        <Card className="relative overflow-hidden">
          <div className="text-center py-8 px-6">
            <div className="text-5xl mb-4">💚</div>
            <p className="text-gray-300 text-lg italic mb-4">"{story.content}"</p>
            <p className="text-primary-gold font-semibold">— {story.author}</p>
            <p className="text-gray-500 text-sm capitalize">{story.role}</p>
            {story.rating && (
              <div className="mt-2 text-yellow-400">{'⭐'.repeat(story.rating)}</div>
            )}
          </div>

          {/* Dots */}
          {stories.length > 1 && (
            <div className="flex justify-center gap-2 pb-4">
              {stories.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-2.5 h-2.5 rounded-full transition ${i === current ? 'bg-primary-gold' : 'bg-gray-600'}`} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

export default SuccessStoriesPage
