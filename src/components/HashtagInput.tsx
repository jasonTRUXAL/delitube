import React, { useState, useEffect, useRef } from 'react';
import { X, Hash, Plus } from 'lucide-react';
import { useHashtagStore } from '../stores/hashtagStore';

type HashtagInputProps = {
  selectedHashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  maxHashtags?: number;
};

const HashtagInput: React.FC<HashtagInputProps> = ({ 
  selectedHashtags, 
  onHashtagsChange, 
  maxHashtags = 3 
}) => {
  const { hashtags, fetchHashtags } = useHashtagStore();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredHashtags, setFilteredHashtags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    fetchHashtags();
  }, [fetchHashtags]);
  
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = hashtags
        .map(h => h.name)
        .filter(name => 
          name.toLowerCase().includes(inputValue.toLowerCase()) &&
          !selectedHashtags.includes(name)
        )
        .slice(0, 10);
      setFilteredHashtags(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue, hashtags, selectedHashtags]);
  
  const normalizeHashtag = (input: string) => {
    return input.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 30);
  };
  
  const addHashtag = (hashtag: string) => {
    const normalized = normalizeHashtag(hashtag);
    if (normalized && !selectedHashtags.includes(normalized) && selectedHashtags.length < maxHashtags) {
      onHashtagsChange([...selectedHashtags, normalized]);
      setInputValue('');
      setShowSuggestions(false);
    }
  };
  
  const removeHashtag = (hashtag: string) => {
    onHashtagsChange(selectedHashtags.filter(h => h !== hashtag));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        addHashtag(inputValue.trim());
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <label className="block text-sm font-black text-brutal-black font-mono uppercase">
        HASHTAGS <span className="text-brutal-gray">(MAX {maxHashtags})</span>
      </label>
      
      {/* Selected hashtags */}
      {selectedHashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedHashtags.map((hashtag) => (
            <div
              key={hashtag}
              className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1 border-2 border-brutal-black font-mono font-bold uppercase text-sm"
            >
              <Hash size={12} />
              <span>{hashtag}</span>
              <button
                type="button"
                onClick={() => removeHashtag(hashtag)}
                className="hover:bg-white hover:text-primary-600 transition-colors p-1 border border-transparent hover:border-brutal-black"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Input field */}
      {selectedHashtags.length < maxHashtags && (
        <div className="relative">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => inputValue.trim() && setShowSuggestions(true)}
                className="input-brutal w-full px-4 py-3 pl-12 font-mono placeholder:text-brutal-gray"
                placeholder="Add hashtag..."
                maxLength={30}
              />
              <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brutal-gray" />
            </div>
            
            <button
              type="button"
              onClick={() => inputValue.trim() && addHashtag(inputValue.trim())}
              disabled={!inputValue.trim()}
              className="btn-brutal px-4 py-3 ml-2"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {/* Suggestions dropdown */}
          {showSuggestions && filteredHashtags.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-10 mt-1 card-brutal max-h-48 overflow-y-auto">
              {filteredHashtags.map((hashtag) => (
                <button
                  key={hashtag}
                  type="button"
                  onClick={() => addHashtag(hashtag)}
                  className="w-full text-left px-4 py-2 hover:bg-primary-100 transition-colors border-b border-brutal-black last:border-b-0 font-mono font-bold uppercase text-sm"
                >
                  <Hash size={12} className="inline mr-2" />
                  {hashtag}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-brutal-gray font-bold uppercase">
        HASHTAGS HELP USERS DISCOVER YOUR CONTENT. USE RELEVANT KEYWORDS.
      </p>
    </div>
  );
};

export default HashtagInput;