'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CommentResponse, CommentCreateRequest } from '@/types/comment';
import { getComments, createComment } from '@/lib/api/comment';
import CommentItem from './CommentItem';
import { ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

interface CommentSectionProps {
  placeId: string;
}

export default function CommentSection({ placeId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // 댓글 작성 폼 상태
  const [isWriting, setIsWriting] = useState(false);
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 댓글 목록 로딩
  const loadComments = async (page: number = 0) => {
    setIsLoading(true);
    try {
      const response = await getComments(placeId, page, 5);
      setComments(response.content);
      setCurrentPage(response.currentPage);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('댓글을 불러오는데 실패했습니다:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 댓글 작성
  const handleSubmitComment = async () => {
    if (!nickname.trim() || !password.trim() || !content.trim()) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const commentData: CommentCreateRequest = {
        nickname: nickname.trim(),
        password: password.trim(),
        content: content.trim()
      };
      
      await createComment(placeId, commentData);
      
      // 폼 초기화
      setNickname('');
      setPassword('');
      setContent('');
      setIsWriting(false);
      
      // 댓글 목록 새로고침 (첫 페이지로)
      setCurrentPage(0);
      await loadComments(0);
      
      alert('댓글이 작성되었습니다.');
    } catch (error) {
      console.error('댓글 작성에 실패했습니다:', error);
      alert('댓글 작성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      loadComments(newPage);
    }
  };

  // 페이지네이션 그룹 계산
  const getPageGroups = () => {
    const groups = [];
    for (let i = 0; i < totalPages; i += 5) {
      groups.push({
        start: i,
        end: Math.min(i + 4, totalPages - 1),
        pages: Array.from({ length: Math.min(5, totalPages - i) }, (_, idx) => i + idx)
      });
    }
    return groups;
  };

  const currentGroup = Math.floor(currentPage / 5);
  const pageGroups = getPageGroups();

  useEffect(() => {
    loadComments();
  }, [placeId]);

  return (
    <div>
      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            댓글 {totalElements}개
          </h3>
        </div>
        <Button
          onClick={() => setIsWriting(!isWriting)}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isWriting ? '취소' : '댓글 쓰기'}
        </Button>
      </div>

      {/* 댓글 작성 폼 */}
      {isWriting && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={20}
            />
            <Input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={20}
            />
          </div>
          <Textarea
            placeholder="댓글을 입력해주세요..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={500}
            className="mb-3"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {content.length}/500
            </span>
            <Button
              onClick={handleSubmitComment}
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting ? '작성 중...' : '작성완료'}
            </Button>
          </div>
        </div>
      )}

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">댓글을 불러오는 중...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          첫 번째 댓글을 작성해보세요!
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment, index) => (
            <div 
              key={comment.id} 
              className={`${index !== comments.length - 1 ? 'border-b border-gray-100' : ''} py-4`}
            >
              <CommentItem
                comment={comment}
                onCommentUpdate={() => loadComments(currentPage)}
              />
            </div>
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {/* 이전 그룹 */}
          {currentGroup > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((currentGroup - 1) * 5 + 4)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}

          {/* 현재 그룹의 페이지들 */}
          {pageGroups[currentGroup]?.pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => handlePageChange(page)}
              className={currentPage === page ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              {page + 1}
            </Button>
          ))}

          {/* 다음 그룹 */}
          {currentGroup < pageGroups.length - 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange((currentGroup + 1) * 5)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
} 