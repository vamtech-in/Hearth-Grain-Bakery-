import React, { useState, useEffect } from 'react';
import { bakeryApi } from '../services/api';
import { useCart } from '../context/CartContext';

export default function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    author: '',
    rating: 5,
    title: '',
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useCart();

  const fetchReviews = async () => {
    try {
      const res = await bakeryApi.getReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (e) {
      console.error('Error fetching reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author.trim() || !formData.comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await bakeryApi.submitReview(formData);
      if (res.success) {
        showToast('Thank you for your warm words!', 'success');
        setIsModalOpen(false);
        setFormData({ author: '', rating: 5, title: '', comment: '' });
        fetchReviews();
      }
    } catch (err) {
      showToast('Could not submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="reviews-section">
      <div className="container">
        <div className="section-heading reviews-heading">
          <div>
            <span className="eyebrow">COMMUNITY WORDS</span>
            <h2>Baked with love. <span>Loved in return.</span></h2>
          </div>
          <div className="reviews-heading-action">
            <p>From neighbourhood regulars to weekend travelers, here is what guests have to say.</p>
            <button 
              className="button button-secondary review-trigger-btn"
              onClick={() => setIsModalOpen(true)}
            >
              ★ Leave a Review
            </button>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map(rev => (
            <article key={rev.id} className="review-card">
              <div className="review-card-stars">
                {'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}
              </div>
              <h4 className="review-title">"{rev.title}"</h4>
              <p className="review-comment">{rev.comment}</p>
              <div className="review-author-meta">
                <div className="author-avatar">{rev.author.charAt(0)}</div>
                <div>
                  <strong>{rev.author}</strong>
                  <small>{rev.date} • {rev.verified ? 'Verified Patron ✓' : 'Guest'}</small>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Review Submission Modal */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div 
              className="modal-content review-modal"
              onClick={e => e.stopPropagation()}
              role="dialog"
            >
              <div className="modal-header">
                <div>
                  <span className="eyebrow">SHARE YOUR EXPERIENCE</span>
                  <h3>Write a Bakery Review</h3>
                </div>
                <button 
                  className="modal-close-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="review-form">
                <div className="form-group">
                  <label>Your Overall Rating</label>
                  <div className="star-rating-picker">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                        onClick={() => setFormData({ ...formData, rating: star })}
                        aria-label={`${star} Stars`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="rating-text">{formData.rating} out of 5 stars</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="revAuthor">Your Name *</label>
                  <input
                    type="text"
                    id="revAuthor"
                    required
                    placeholder="e.g. Sanya Kapoor"
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="revTitle">Headline / Summary</label>
                  <input
                    type="text"
                    id="revTitle"
                    placeholder="e.g. Best morning croissants!"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="revComment">Your Review *</label>
                  <textarea
                    id="revComment"
                    required
                    rows="3"
                    placeholder="Tell us about your favorite bake or visit..."
                    value={formData.comment}
                    onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  />
                </div>

                <div className="modal-footer-actions">
                  <button 
                    type="button" 
                    className="button button-secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="button button-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Posting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
