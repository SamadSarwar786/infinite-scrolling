import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

// Simulate API data
const generatePosts = (page, limit = 10) => {
  const posts = []
  const startId = (page - 1) * limit + 1
  
  for (let i = 0; i < limit; i++) {
    const id = startId + i
    posts.push({
      id,
      title: `Post ${id}: Lorem ipsum dolor sit amet`,
      content: `This is the content for post ${id}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.`,
      author: `User ${Math.floor(Math.random() * 100) + 1}`,
      date: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString(),
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50)
    })
  }
  
  return posts
}

// Simulate API call with delay
const fetchPosts = (page) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generatePosts(page))
    }, 1000 + Math.random() * 1000) // Random delay between 1-2 seconds
  })
}

function PostCard({ post }) {
  return (
    <div className="post-card">
      <div className="post-header">
        <h3 className="post-title">{post.title}</h3>
        <span className="post-date">{post.date}</span>
      </div>
      <p className="post-content">{post.content}</p>
      <div className="post-footer">
        <span className="post-author">By {post.author}</span>
        <div className="post-stats">
          <span className="post-likes">❤️ {post.likes}</span>
          <span className="post-comments">💬 {post.comments}</span>
        </div>
      </div>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>Loading more posts...</p>
    </div>
  )
}

function App() {
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const observerRef = useRef()

  // Load initial posts
  useEffect(() => {
    loadPosts(1)
  }, [])

  const loadPosts = async (pageNum) => {
    if (loading) return
    
    setLoading(true)
    try {
      const newPosts = await fetchPosts(pageNum)
      
      if (pageNum === 1) {
        setPosts(newPosts)
      } else {
        setPosts(prev => [...prev, ...newPosts])
      }
      
      // Simulate ending of data after page 10
      if (pageNum >= 10) {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading posts:', error)
    } finally {
      setLoading(false)
    }
  }

  // Infinite scroll logic
  const lastPostElementRef = useCallback(node => {
    if (loading) return
    if (observerRef.current) observerRef.current.disconnect()
    
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        const nextPage = page + 1
        setPage(nextPage)
        loadPosts(nextPage)
      }
    })
    
    if (node) observerRef.current.observe(node)
  }, [loading, hasMore, page])

  const handleRefresh = () => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    loadPosts(1)
  }



  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 Infinite Scroll Feed</h1>
        <button onClick={handleRefresh} className="refresh-btn">
          🔄 Refresh
        </button>
      </header>
      
      <main className="app-main">
        <div className="posts-container">
          {posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastPostElementRef : null}
            >
              <PostCard post={post} />
            </div>
          ))}
          
          {loading && <LoadingSpinner />}
          
          {!hasMore && posts.length > 0 && (
            <div className="end-message">
              <p>🎉 You've reached the end! No more posts to load.</p>
            </div>
          )}
          
          {posts.length === 0 && !loading && (
            <div className="empty-state">
              <p>No posts available. Click refresh to load posts.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
