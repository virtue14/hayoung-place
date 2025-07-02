'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Place, 
  PlaceCategory, 
  SubCategory,
  CATEGORY_LABELS,
  SUBCATEGORY_LABELS,
  CATEGORY_SUBCATEGORY_MAPPING
} from '@/types/place';
import { verifyPlacePassword, updatePlace } from '@/lib/api/place';
import { MapPin, Edit } from 'lucide-react';

interface EditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place;
  onPlaceUpdated: (updatedPlace: Place) => void;
}

export default function EditPlaceModal({ isOpen, onClose, place, onPlaceUpdated }: EditPlaceModalProps) {
  // 상태 관리
  const [step, setStep] = useState<'password' | 'edit'>('password');
  const [password, setPassword] = useState('');
  const [description, setDescription] = useState(place.description);
  const [category, setCategory] = useState<PlaceCategory>(place.category);
  const [subCategory, setSubCategory] = useState<SubCategory>(place.subCategory);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  // 컴포넌트가 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setStep('password');
      setPassword('');
      setDescription(place.description);
      setCategory(place.category);
      setSubCategory(place.subCategory);
      setIsVerifyingPassword(false);
      setIsUpdating(false);
    }
  }, [isOpen, place]);

  // 1차 카테고리 변경 시 2차 카테고리 검증 및 초기화
  useEffect(() => {
    if (category !== place.category) {
      const availableSubCategories = CATEGORY_SUBCATEGORY_MAPPING[category];
      if (!availableSubCategories.includes(subCategory)) {
        setSubCategory(availableSubCategories[0] || SubCategory.NONE);
      }
    }
  }, [category, subCategory, place.category]);

  // 비밀번호 확인
  const handlePasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    setIsVerifyingPassword(true);
    try {
      await verifyPlacePassword(place.id, password.trim());
      setStep('edit');
    } catch (error) {
      console.error('비밀번호 확인에 실패했습니다:', error);
      alert('비밀번호가 일치하지 않습니다.');
    } finally {
      setIsVerifyingPassword(false);
    }
  };

  // 장소 수정
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('장소 설명을 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData = {
        category,
        subCategory,
        description: description.trim(),
        password: password.trim(),
      };
      
      const updatedPlace = await updatePlace(place.id, updateData);
      onPlaceUpdated(updatedPlace);
      onClose();
      alert('장소 정보가 수정되었습니다.');
    } catch (error) {
      console.error('장소 수정에 실패했습니다:', error);
      const errorResponse = error as { response?: { status?: number; data?: { message?: string } } };
      if (errorResponse.response?.status === 403) {
        alert('비밀번호가 일치하지 않습니다.');
      } else {
        alert('장소 수정에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // 현재 선택된 1차 카테고리에 따른 2차 카테고리 옵션들
  const availableSubCategories = CATEGORY_SUBCATEGORY_MAPPING[category];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex-shrink-0">
          <DialogTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit className="w-5 h-5" />
            장소 정보 수정
          </DialogTitle>
        </DialogHeader>

        {step === 'password' ? (
          /* 비밀번호 확인 단계 */
          <form onSubmit={handlePasswordVerify} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {/* 장소 정보 표시 */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{place.address}</p>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        {CATEGORY_LABELS[place.category]}
                      </span>
                      {place.subCategory && place.subCategory !== SubCategory.NONE && (
                        <>
                          <span className="text-gray-400 text-sm">〉</span>
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">
                            {SUBCATEGORY_LABELS[place.subCategory]}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  수정 비밀번호
                </label>
                <Input
                  id="password"
                  type="password"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-10 text-sm rounded-lg"
                  placeholder="등록 시 입력한 비밀번호를 입력하세요"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  장소 등록 시 설정한 비밀번호를 입력해주세요.
                </p>
              </div>
            </div>
            
            <DialogFooter className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="flex gap-2 w-full">
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-10 text-sm rounded-lg"
                  >
                    취소
                  </Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isVerifyingPassword} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm rounded-lg"
                >
                  {isVerifyingPassword ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      확인 중...
                    </span>
                  ) : (
                    '확인'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        ) : (
          /* 수정 단계 */
          <form onSubmit={handleUpdate} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
              {/* 장소 기본 정보 (수정 불가) */}
              <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{place.name}</h3>
                    <p className="text-sm text-gray-600">{place.address}</p>
                  </div>
                </div>
              </div>

              {/* 1차 카테고리 선택 */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">1차 카테고리</label>
                <Select value={category} onValueChange={(value: PlaceCategory) => setCategory(value)} required>
                  <SelectTrigger id="category" className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg">
                    <SelectValue placeholder="장소 종류 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg max-h-48">
                    {Object.entries(CATEGORY_LABELS).map(([key, name]) => (
                      <SelectItem 
                        key={key} 
                        value={key} 
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 text-sm py-2 cursor-pointer"
                      >
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 2차 카테고리 선택 */}
              {availableSubCategories.length > 0 && (
                <div>
                  <label htmlFor="subcategory" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">2차 카테고리</label>
                  <Select value={subCategory} onValueChange={(value: SubCategory) => setSubCategory(value)} required>
                    <SelectTrigger id="subcategory" className="h-10 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg">
                      <SelectValue placeholder="세부 카테고리 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-lg max-h-48">
                      {availableSubCategories.map((subCat) => (
                        <SelectItem 
                          key={subCat} 
                          value={subCat} 
                          className="hover:bg-gray-100 dark:hover:bg-gray-700 text-sm py-2 cursor-pointer"
                        >
                          {SUBCATEGORY_LABELS[subCat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 장소 설명 */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">장소 설명</label>
                <Textarea
                  id="description"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 h-24 text-sm rounded-lg resize-none"
                  placeholder="추천 이유, 특징, 꿀팁 등을 적어주세요."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  maxLength={500}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-xs text-gray-500">
                    {description.length}/500
                  </span>
                </div>
              </div>
            </div>
            
            <DialogFooter className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="flex gap-2 w-full">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep('password')}
                  className="flex-1 h-10 text-sm rounded-lg"
                >
                  이전
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm rounded-lg"
                >
                  {isUpdating ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      수정 중...
                    </span>
                  ) : (
                    '수정완료'
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
} 