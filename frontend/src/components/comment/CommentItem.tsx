'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CommentResponse, CommentCreateRequest, CommentUpdateRequest, CommentDeleteRequest } from '@/types/comment';
import { createComment, updateComment, deleteComment } from '@/lib/api/comment';
import { MoreHorizontal, Reply, Edit, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CommentItemProps {
  comment: CommentResponse;
  onCommentUpdate: () => void;
  isReply?: boolean; // 대댓글인지 구분하는 props 추가
}

export default function CommentItem({ comment, onCommentUpdate, isReply = false }: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  
  // 수정 폼 상태
  const [editPassword, setEditPassword] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // 삭제 폼 상태
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  
  // 대댓글 작성 폼 상태
  const [replyNickname, setReplyNickname] = useState('');
  const [replyPassword, setReplyPassword] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // 시간 포맷팅
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return '알 수 없음';
    }
  };

  // 댓글 수정
  const handleUpdate = async () => {
    if (!editPassword.trim() || !editContent.trim()) {
      alert('비밀번호와 내용을 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: CommentUpdateRequest = {
        password: editPassword.trim(),
        content: editContent.trim()
      };
      
      await updateComment(comment.placeId, comment.id, updateData);
      
      setIsEditing(false);
      setEditPassword('');
      onCommentUpdate();
      
      alert('댓글이 수정되었습니다.');
    } catch (error) {
      console.error('댓글 수정에 실패했습니다:', error);
      alert('비밀번호가 일치하지 않거나 수정에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  // 댓글 삭제
  const handleDelete = async () => {
    if (!deletePassword.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    if (!confirm('정말로 삭제하시겠습니까?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const deleteData: CommentDeleteRequest = {
        password: deletePassword.trim()
      };
      
      await deleteComment(comment.placeId, comment.id, deleteData);
      
      setShowDeleteForm(false);
      setDeletePassword('');
      onCommentUpdate();
      
      alert('댓글이 삭제되었습니다.');
    } catch (error) {
      console.error('댓글 삭제에 실패했습니다:', error);
      alert('비밀번호가 일치하지 않거나 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 대댓글 작성
  const handleReplySubmit = async () => {
    if (!replyNickname.trim() || !replyPassword.trim() || !replyContent.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const replyData: CommentCreateRequest = {
        nickname: replyNickname.trim(),
        password: replyPassword.trim(),
        content: replyContent.trim(),
        parentId: comment.id
      };
      
      await createComment(comment.placeId, replyData);
      
      // 폼 초기화
      setReplyNickname('');
      setReplyPassword('');
      setReplyContent('');
      setIsReplying(false);
      
      onCommentUpdate();
      
      alert('대댓글이 작성되었습니다.');
    } catch (error) {
      console.error('대댓글 작성에 실패했습니다:', error);
      alert('대댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const isDeleted = comment.isDeleted;

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-blue-100' : ''} pb-4`}>
      {/* 댓글 헤더와 내용 */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {isReply && <Reply className="w-4 h-4 text-blue-500" />}
            <span className={`font-medium ${isReply ? 'text-sm text-gray-700' : 'text-gray-900'}`}>
              {isDeleted ? '삭제된 사용자' : comment.nickname}
            </span>
            <span className={`text-xs text-gray-500`}>
              {formatTime(comment.createdAt)}
            </span>
            {comment.createdAt !== comment.updatedAt && !isDeleted && (
              <span className="text-xs text-gray-400">(수정됨)</span>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={500}
                className="text-sm"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-28 h-8 text-sm"
                />
                <Button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {isUpdating ? '수정 중...' : '수정완료'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                    setEditPassword('');
                  }}
                  size="sm"
                  className="h-8 text-xs"
                >
                  취소
                </Button>
              </div>
            </div>
          ) : (
            <p className={`leading-relaxed whitespace-pre-wrap ${isReply ? 'text-sm text-gray-700' : 'text-gray-800'}`}>
              {comment.content}
            </p>
          )}
        </div>

        {/* 액션 버튼들 */}
        {!isDeleted && !isEditing && (
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowActions(!showActions)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
            
            {showActions && (
              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-24">
                {!isReply && ( // 원댓글에만 답글 버튼 표시
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsReplying(!isReplying);
                      setShowActions(false);
                    }}
                    className="w-full justify-start text-xs h-8"
                  >
                    <Reply className="w-3 h-3 mr-2" />
                    답글
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                  className="w-full justify-start text-xs h-8"
                >
                  <Edit className="w-3 h-3 mr-2" />
                  수정
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDeleteForm(true);
                    setShowActions(false);
                  }}
                  className="w-full justify-start text-red-600 hover:text-red-700 text-xs h-8"
                >
                  <Trash2 className="w-3 h-3 mr-2" />
                  삭제
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 삭제 폼 */}
      {showDeleteForm && (
        <div className="mt-3 p-3 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-700 mb-2">정말로 삭제하시겠습니까?</p>
          <div className="flex items-center gap-2">
            <Input
              type="password"
              placeholder="비밀번호"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-28 h-8 text-sm"
            />
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              size="sm"
              variant="destructive"
              className="h-8 text-xs"
            >
              {isDeleting ? '삭제 중...' : '삭제'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteForm(false);
                setDeletePassword('');
              }}
              size="sm"
              className="h-8 text-xs"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 대댓글 작성 폼 (원댓글에만 표시) */}
      {isReplying && !isReply && (
        <div className="mt-4 ml-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="닉네임"
                value={replyNickname}
                onChange={(e) => setReplyNickname(e.target.value)}
                maxLength={20}
                className="h-8 text-sm"
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={replyPassword}
                onChange={(e) => setReplyPassword(e.target.value)}
                maxLength={20}
                className="h-8 text-sm"
              />
            </div>
            <Textarea
              placeholder="답글을 입력해주세요..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={2}
              maxLength={500}
              className="text-sm"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {replyContent.length}/500
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsReplying(false);
                    setReplyNickname('');
                    setReplyPassword('');
                    setReplyContent('');
                  }}
                  size="sm"
                  className="h-8 text-xs"
                >
                  취소
                </Button>
                <Button
                  onClick={handleReplySubmit}
                  disabled={isSubmittingReply}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {isSubmittingReply ? '작성 중...' : '답글 작성'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 대댓글 목록 (원댓글에만 표시) */}
      {!isReply && comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onCommentUpdate={onCommentUpdate}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
} 