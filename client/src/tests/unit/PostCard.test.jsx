// client/src/tests/unit/PostCard.test.jsx - Unit tests for PostCard component

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PostCard from '../../components/PostCard';

describe('PostCard Component', () => {
  const mockPost = {
    _id: '1',
    title: 'Test Post Title',
    content: 'This is a test post content that should be displayed in the card. It contains enough text to test the truncation functionality.',
    excerpt: 'This is a test post excerpt',
    author: {
      username: 'testuser',
      profile: {
        firstName: 'John',
        lastName: 'Doe'
      }
    },
    category: {
      name: 'Technology'
    },
    publishedAt: '2023-01-15T10:00:00Z',
    readTime: 5,
    views: 100,
    likeCount: 25,
    commentCount: 10,
    tags: ['react', 'testing', 'javascript'],
    status: 'published'
  };

  const mockHandlers = {
    onLike: jest.fn(),
    onView: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test rendering
  it('renders post card with all basic information', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Test Post Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
    expect(screen.getByText('By John Doe')).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('25 Like')).toBeInTheDocument();
    expect(screen.getByText('View Post')).toBeInTheDocument();
  });

  it('renders post with author username when profile names are not available', () => {
    const postWithoutProfile = {
      ...mockPost,
      author: {
        username: 'testuser'
      }
    };

    render(<PostCard post={postWithoutProfile} />);
    
    expect(screen.getByText('By testuser')).toBeInTheDocument();
  });

  it('renders post with "Unknown Author" when author is not available', () => {
    const postWithoutAuthor = {
      ...mockPost,
      author: null
    };

    render(<PostCard post={postWithoutAuthor} />);
    
    expect(screen.getByText('By Unknown Author')).toBeInTheDocument();
  });

  // Test date formatting
  it('formats published date correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('Jan 15, 2023')).toBeInTheDocument();
  });

  // Test tags rendering
  it('renders tags correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('#react')).toBeInTheDocument();
    expect(screen.getByText('#testing')).toBeInTheDocument();
    expect(screen.getByText('#javascript')).toBeInTheDocument();
  });

  it('does not render tags section when no tags are provided', () => {
    const postWithoutTags = {
      ...mockPost,
      tags: []
    };

    render(<PostCard post={postWithoutTags} />);
    
    expect(screen.queryByText('#react')).not.toBeInTheDocument();
  });

  // Test status display
  it('shows status when post is not published', () => {
    const draftPost = {
      ...mockPost,
      status: 'draft'
    };

    render(<PostCard post={draftPost} />);
    
    expect(screen.getByText('draft')).toBeInTheDocument();
    expect(screen.getByTestId('post-status')).toBeInTheDocument();
  });

  it('does not show status for published posts', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.queryByTestId('post-status')).not.toBeInTheDocument();
  });

  // Test action buttons
  it('calls onLike when like button is clicked', () => {
    render(<PostCard post={mockPost} onLike={mockHandlers.onLike} />);
    
    const likeButton = screen.getByTestId('like-button');
    fireEvent.click(likeButton);
    
    expect(mockHandlers.onLike).toHaveBeenCalledWith('1');
  });

  it('calls onView when view button is clicked', () => {
    render(<PostCard post={mockPost} onView={mockHandlers.onView} />);
    
    const viewButton = screen.getByTestId('view-button');
    fireEvent.click(viewButton);
    
    expect(mockHandlers.onView).toHaveBeenCalledWith('1');
  });

  it('calls onView when title is clicked', () => {
    render(<PostCard post={mockPost} onView={mockHandlers.onView} />);
    
    const title = screen.getByText('Test Post Title');
    fireEvent.click(title);
    
    expect(mockHandlers.onView).toHaveBeenCalledWith('1');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<PostCard post={mockPost} onEdit={mockHandlers.onEdit} isAuthor={true} />);
    
    const editButton = screen.getByTestId('edit-button');
    fireEvent.click(editButton);
    
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('1');
  });

  it('calls onDelete when delete button is clicked', () => {
    // Mock window.confirm to return true
    window.confirm = jest.fn(() => true);
    
    render(<PostCard post={mockPost} onDelete={mockHandlers.onDelete} isAuthor={true} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this post?');
    expect(mockHandlers.onDelete).toHaveBeenCalledWith('1');
  });

  it('does not call onDelete when user cancels confirmation', () => {
    // Mock window.confirm to return false
    window.confirm = jest.fn(() => false);
    
    render(<PostCard post={mockPost} onDelete={mockHandlers.onDelete} isAuthor={true} />);
    
    const deleteButton = screen.getByTestId('delete-button');
    fireEvent.click(deleteButton);
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockHandlers.onDelete).not.toHaveBeenCalled();
  });

  // Test author-only actions
  it('shows edit and delete buttons only for author', () => {
    render(<PostCard post={mockPost} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} isAuthor={true} />);
    
    expect(screen.getByTestId('edit-button')).toBeInTheDocument();
    expect(screen.getByTestId('delete-button')).toBeInTheDocument();
  });

  it('does not show edit and delete buttons for non-author', () => {
    render(<PostCard post={mockPost} onEdit={mockHandlers.onEdit} onDelete={mockHandlers.onDelete} isAuthor={false} />);
    
    expect(screen.queryByTestId('edit-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument();
  });

  // Test like button state
  it('shows correct like button state when post is liked', () => {
    render(<PostCard post={mockPost} onLike={mockHandlers.onLike} isLiked={true} />);
    
    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toHaveTextContent('25 Liked');
    expect(likeButton).toHaveClass('btn-primary');
  });

  it('shows correct like button state when post is not liked', () => {
    render(<PostCard post={mockPost} onLike={mockHandlers.onLike} isLiked={false} />);
    
    const likeButton = screen.getByTestId('like-button');
    expect(likeButton).toHaveTextContent('25 Like');
    expect(likeButton).toHaveClass('btn-secondary');
  });

  // Test content truncation
  it('uses excerpt when available', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('This is a test post excerpt')).toBeInTheDocument();
  });

  it('shows full content when excerpt is not available and content is short', () => {
    const postWithoutExcerpt = {
      ...mockPost,
      excerpt: null
    };

    render(<PostCard post={postWithoutExcerpt} />);
    
    expect(screen.getByText('This is a test post content that should be displayed in the card. It contains enough text to test the truncation functionality.')).toBeInTheDocument();
  });

  it('truncates content when excerpt is not available and content is long', () => {
    const longContent = 'This is a very long post content that should be truncated because it exceeds the maximum length allowed for display in the post card. The truncation should happen at 150 characters and add an ellipsis to indicate that there is more content available. This test ensures that the truncation functionality works correctly when the content is longer than the specified limit.';
    
    const postWithLongContent = {
      ...mockPost,
      excerpt: null,
      content: longContent
    };

    render(<PostCard post={postWithLongContent} />);
    
    // The content should be truncated at 150 characters + "..."
    const truncatedContent = longContent.substring(0, 150) + '...';
    expect(screen.getByText(truncatedContent)).toBeInTheDocument();
  });

  // Test read time calculation
  it('uses provided read time when available', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('5 min read')).toBeInTheDocument();
  });

  it('calculates read time from content when not provided', () => {
    const postWithoutReadTime = {
      ...mockPost,
      readTime: null
    };

    render(<PostCard post={postWithoutReadTime} />);
    
    // Content has 20 words, so read time should be 1 minute (200 words per minute)
    expect(screen.getByText('1 min read')).toBeInTheDocument();
  });

  // Test stats display
  it('displays all stats correctly', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByText('100 views')).toBeInTheDocument();
    expect(screen.getByText('5 min read')).toBeInTheDocument();
    expect(screen.getByText('10 comments')).toBeInTheDocument();
  });

  it('shows zero for missing stats', () => {
    const postWithoutStats = {
      ...mockPost,
      views: null,
      commentCount: null
    };

    render(<PostCard post={postWithoutStats} />);
    
    expect(screen.getByText('0 views')).toBeInTheDocument();
    expect(screen.getByText('0 comments')).toBeInTheDocument();
  });

  // Test actions visibility
  it('hides all actions when showActions is false', () => {
    render(<PostCard post={mockPost} showActions={false} />);
    
    expect(screen.queryByTestId('like-button')).not.toBeInTheDocument();
    expect(screen.queryByTestId('view-button')).not.toBeInTheDocument();
  });

  // Test data attributes
  it('has correct data-testid for post card', () => {
    render(<PostCard post={mockPost} />);
    
    expect(screen.getByTestId('post-card-1')).toBeInTheDocument();
  });
}); 