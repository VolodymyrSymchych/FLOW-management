'use client';

import { useState, useEffect } from 'react';
import { Send, Edit2, Trash2, Reply, CheckCircle2, Circle, X } from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@/hooks/useUser';
import { MentionInput } from './MentionInput';

interface Comment {
  id: number;
  userId: number;
  content: string;
  createdAt: string;
  editedAt?: string;
  status?: string;
  resolvedAt?: string;
  resolvedBy?: number;
  user: {
    id: number;
    username: string;
    fullName?: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

interface CommentsSectionProps {
  entityType: 'task' | 'project';
  entityId: number;
}

export function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<Comment | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [mentionedUsers, setMentionedUsers] = useState<number[]>([]);

  useEffect(() => {
    fetchComments();
  }, [entityType, entityId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/comments?entityType=${entityType}&entityId=${entityId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post('/api/comments', {
        entityType,
        entityId,
        content: newComment.trim(),
        parentId: replyingTo?.id,
        mentions: mentionedUsers,
      });
      
      if (replyingTo) {
        // If replying, add to the parent's replies
        setComments(prev =>
          prev.map(c =>
            c.id === replyingTo.id
              ? { ...c, replies: [...(c.replies || []), response.data.comment] }
              : c
          )
        );
      } else {
        // If top-level comment, add to main list
        setComments(prev => [...prev, response.data.comment]);
      }
      
      setNewComment('');
      setReplyingTo(null);
      setMentionedUsers([]);
    } catch (error: any) {
      console.error('Failed to create comment:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message || 'Failed to create comment';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleResolve = async (commentId: number, resolve: boolean) => {
    try {
      await axios.patch(`/api/comments/${commentId}/resolve`, {
        resolved: resolve,
      });
      
      setComments(prev =>
        prev.map(c => {
          if (c.id === commentId) {
            return {
              ...c,
              status: resolve ? 'resolved' : 'active',
              resolvedAt: resolve ? new Date().toISOString() : undefined,
              resolvedBy: resolve ? user?.id : undefined,
            };
          }
          // Також оновити в replies
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map(r =>
                r.id === commentId
                  ? {
                      ...r,
                      status: resolve ? 'resolved' : 'active',
                      resolvedAt: resolve ? new Date().toISOString() : undefined,
                      resolvedBy: resolve ? user?.id : undefined,
                    }
                  : r
              ),
            };
          }
          return c;
        })
      );
    } catch (error) {
      console.error('Failed to resolve comment:', error);
    }
  };

  const handleEdit = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      await axios.put(`/api/comments/${commentId}`, {
        content: editContent.trim(),
      });
      
      setComments(prev =>
        prev.map(c =>
          c.id === commentId
            ? { ...c, content: editContent.trim(), editedAt: new Date().toISOString() }
            : c
        )
      );
      setEditingId(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to update comment:', error);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await axios.delete(`/api/comments/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 mt-2' : 'mb-4'} ${comment.status === 'resolved' ? 'opacity-60' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm flex-shrink-0">
          {comment.user.username[0].toUpperCase()}
        </div>
        <div className="flex-1">
          <div className={`glass-light rounded-lg px-4 py-2 border border-white/10 ${comment.status === 'resolved' ? 'border-l-4 border-green-500' : ''}`}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-sm text-text-primary">{comment.user.username}</p>
                {comment.status === 'resolved' && (
                  <span className="text-xs text-green-500 flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Resolved</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {comment.status !== 'resolved' && (
                  <button
                    onClick={() => handleResolve(comment.id, true)}
                    className="text-text-tertiary hover:text-green-500 transition-colors"
                    title="Mark as resolved"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
                {comment.status === 'resolved' && (
                  <button
                    onClick={() => handleResolve(comment.id, false)}
                    className="text-text-tertiary hover:text-text-primary transition-colors"
                    title="Mark as active"
                  >
                    <Circle className="w-4 h-4" />
                  </button>
                )}
                {comment.userId === user?.id && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="text-text-tertiary hover:text-text-primary transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-text-tertiary hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
            {editingId === comment.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg glass-light border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(comment.id)}
                    className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 glass-light border border-white/10 rounded-lg text-sm text-text-primary hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="text-sm text-text-primary whitespace-pre-wrap">
                  {comment.content.split(/(@\w+)/g).map((part, idx) => 
                    part.startsWith('@') ? (
                      <span key={idx} className="text-primary-500 font-medium">
                        {part}
                      </span>
                    ) : (
                      <span key={idx}>{part}</span>
                    )
                  )}
                </div>
                {comment.editedAt && (
                  <p className="text-xs text-text-tertiary mt-1">(edited)</p>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-xs text-text-tertiary">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </p>
            {!isReply && (
              <button
                onClick={() => setReplyingTo(comment)}
                className="text-xs text-primary-500 hover:text-primary-600 flex items-center space-x-1 transition-colors"
              >
                <Reply className="w-3 h-3" />
                <span>Reply</span>
              </button>
            )}
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2">
              {comment.replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Comments</h3>
        {comments.length > 0 && (
          <span className="text-sm text-text-secondary">
            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </span>
        )}
      </div>
      
      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-text-secondary text-sm">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="glass-light rounded-lg px-4 py-2 mb-2 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-text-tertiary">Replying to {replyingTo.user.username}</p>
              <p className="text-sm text-text-primary truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* New comment input */}
      <div className="flex items-start space-x-2">
        <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm flex-shrink-0">
          {user?.username[0].toUpperCase() || 'U'}
        </div>
        <div className="flex-1">
          <MentionInput
            value={newComment}
            onChange={(value) => {
              setNewComment(value);
            }}
            onMention={(userId) => {
              if (!mentionedUsers.includes(userId)) {
                setMentionedUsers(prev => [...prev, userId]);
              }
            }}
            placeholder={replyingTo ? `Reply to ${replyingTo.user.username}...` : 'Add a comment...'}
            rows={3}
            className="glass-light border border-white/10"
          />
          <div className="flex items-center justify-end mt-2">
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

