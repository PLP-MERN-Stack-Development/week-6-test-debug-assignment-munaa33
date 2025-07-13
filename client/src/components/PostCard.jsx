// client/src/components/PostCard.jsx - Post card component

import React from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const PostCard = ({ 
  post, 
  onLike, 
  onView, 
  onEdit, 
  onDelete, 
  isLiked = false,
  showActions = true,
  isAuthor = false 
}) => {
  const {
    _id,
    title,
    content,
    excerpt,
    author,
    category,
    publishedAt,
    readTime,
    views,
    likeCount,
    commentCount,
    tags = [],
    status
  } = post;

  const handleLike = () => {
    if (onLike) {
      onLike(_id);
    }
  };

  const handleView = () => {
    if (onView) {
      onView(_id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(_id);
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this post?')) {
      onDelete(_id);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <article className="post-card" data-testid={`post-card-${_id}`}>
      <div className="post-header">
        <h3 className="post-title" onClick={handleView} style={{ cursor: 'pointer' }}>
          {title}
        </h3>
        
        {status !== 'published' && (
          <span className="post-status" data-testid="post-status">
            {status}
          </span>
        )}
      </div>

      <div className="post-meta">
        <span className="post-author">
          By {author?.profile?.firstName && author?.profile?.lastName 
            ? `${author.profile.firstName} ${author.profile.lastName}`
            : author?.username || 'Unknown Author'
          }
        </span>
        
        {publishedAt && (
          <span className="post-date">
            {formatDate(publishedAt)}
          </span>
        )}
        
        {category && (
          <span className="post-category">
            {category.name}
          </span>
        )}
      </div>

      <div className="post-content">
        <p>{excerpt || truncateText(content)}</p>
      </div>

      {tags.length > 0 && (
        <div className="post-tags">
          {tags.map((tag, index) => (
            <span key={index} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="post-stats">
        <span className="stat">
          <i className="icon-eye"></i>
          {views || 0} views
        </span>
        <span className="stat">
          <i className="icon-time"></i>
          {readTime || Math.ceil(content.split(' ').length / 200)} min read
        </span>
        <span className="stat">
          <i className="icon-comment"></i>
          {commentCount || 0} comments
        </span>
      </div>

      {showActions && (
        <div className="post-actions">
          <Button
            variant={isLiked ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleLike}
            data-testid="like-button"
          >
            <i className={`icon-heart${isLiked ? '-filled' : ''}`}></i>
            {likeCount || 0} {isLiked ? 'Liked' : 'Like'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleView}
            data-testid="view-button"
          >
            View Post
          </Button>

          {isAuthor && (
            <>
              <Button
                variant="warning"
                size="sm"
                onClick={handleEdit}
                data-testid="edit-button"
              >
                Edit
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                data-testid="delete-button"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )}
    </article>
  );
};

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    author: PropTypes.shape({
      username: PropTypes.string,
      profile: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string
      })
    }),
    category: PropTypes.shape({
      name: PropTypes.string
    }),
    publishedAt: PropTypes.string,
    readTime: PropTypes.number,
    views: PropTypes.number,
    likeCount: PropTypes.number,
    commentCount: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    status: PropTypes.oneOf(['draft', 'published', 'archived'])
  }).isRequired,
  onLike: PropTypes.func,
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  isLiked: PropTypes.bool,
  showActions: PropTypes.bool,
  isAuthor: PropTypes.bool
};

export default PostCard; 