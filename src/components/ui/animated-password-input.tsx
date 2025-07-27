import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

interface AnimatedPasswordInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  label?: string;
  error?: string;
}

export const AnimatedPasswordInput: React.FC<AnimatedPasswordInputProps> = ({
  placeholder = "Enter password",
  value,
  onChange,
  className = "",
  label,
  error
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const revealedInputRef = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    setIsRevealed(!isRevealed);
    setTimeout(() => {
      if (!isRevealed) {
        revealedInputRef.current?.focus();
      } else {
        hiddenInputRef.current?.focus();
      }
    }, 150);
  };

  const handleHiddenInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isRevealed) {
      onChange(e.target.value);
    }
  };

  const handleRevealedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isRevealed) {
      onChange(e.target.value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      
      <div 
        ref={containerRef}
        className={`relative h-12 w-full rounded-md overflow-hidden border border-input bg-background ${
          isActive ? 'ring-2 ring-primary/20' : ''
        }`}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
      >
        {/* Hidden State */}
        <motion.div 
          className="absolute inset-0 bg-[#121726] flex items-center px-10 pr-12"
          animate={{
            clipPath: isRevealed 
              ? "polygon(85.39075% 28.16254%, 85.86161% 27.31304%, 86.33801% 26.7167%, 86.81675% 26.36695%, 87.29462% 26.25723%, 87.7684% 26.38091%, 88.23487% 26.73144%, 88.69081% 27.30221%, 89.13302% 28.08664%, 89.55826% 29.07816%, 89.96332% 30.27017%, 90.345% 31.6561%, 90.70007% 33.22935%, 91.02531% 34.98333%, 91.31751% 36.91147%, 91.57346% 39.00718%, 91.78992% 41.26386%, 91.95983% 43.6181%, 92.0791% 46.00012%, 92.14904% 48.39386%, 92.17099% 50.78321%, 92.14625% 53.15209%, 92.07615% 55.48444%, 91.96199% 57.76415%, 91.80511% 59.97518%, 91.6068% 62.10138%, 91.3684% 64.12672%, 91.09122% 66.0351%, 90.77657% 67.81044%, 90.42577% 69.43666%, 90.04014% 70.89766%, 89.621% 72.17737%, 89.16967% 73.25972%, 88.69881% 74.10923%, 88.22241% 74.70556%, 87.74366% 75.05532%, 87.26579% 75.16504%, 86.79201% 75.04135%, 86.32555% 74.69083%, 85.86961% 74.12006%, 85.4274% 73.33563%, 85.00216% 72.3441%, 84.59709% 71.15209%, 84.21541% 69.76616%, 83.86035% 68.19292%, 83.53511% 66.43893%, 83.2429% 64.51079%, 82.98696% 62.41508%, 82.77049% 60.1584%, 82.60059% 57.80416%, 82.48132% 55.42214%, 82.41137% 53.0284%, 82.38942% 50.63905%, 82.41416% 48.27017%, 82.48427% 45.93782%, 82.59843% 43.65811%, 82.75531% 41.4471%, 82.95362% 39.3209%, 83.19202% 37.29556%, 83.4692% 35.38717%, 83.78385% 33.61184%, 84.13465% 31.98561%, 84.52027% 30.5246%, 84.93942% 29.2449%)"
              : "polygon(2.28031% 0%, 14.21024% 0.00147%, 26.14016% 0%, 38.07008% 0.00147%, 50% 0%, 61.92992% 0.00147%, 73.85984% 0%, 85.78976% 0.00147%, 97.71969% 0%, 98.18037% 0.23084%, 98.60894% 0.89324%, 98.99635% 1.94205%, 99.33358% 3.33211%, 99.61159% 5.01825%, 99.82135% 6.95531%, 99.95383% 9.09814%, 100% 11.40157%, 100.00029% 21.05118%, 100% 30.70079%, 100.00029% 40.35039%, 100% 50%, 100.00029% 59.64961%, 100% 69.29921%, 100.00029% 78.94882%, 100% 88.59843%, 99.95383% 90.90186%, 99.82135% 93.04469%, 99.61159% 94.98175%, 99.33358% 96.66789%, 98.99635% 98.05795%, 98.60894% 99.10676%, 98.18037% 99.76916%, 97.71969% 100%, 85.78976% 100.00147%, 73.85984% 100%, 61.92992% 100.00147%, 50% 100%, 38.07008% 100.00147%, 26.14016% 100%, 14.21024% 100.00147%, 2.28031% 100%, 1.81963% 99.76916%, 1.39106% 99.10676%, 1.00365% 98.05795%, 0.66642% 96.66789%, 0.38841% 94.98175%, 0.17865% 93.04469%, 0.04617% 90.90186%, 0% 88.59843%, 0.00029% 78.94882%, 0% 69.29921%, 0.00029% 59.64961%, 0% 50%, 0.00029% 40.35039%, 0% 30.70079%, 0.00029% 21.05118%, 0% 11.40157%, 0.04617% 9.09814%, 0.17865% 6.95531%, 0.38841% 5.01825%, 0.66642% 3.33211%, 1.00365% 1.94205%, 1.39106% 0.89324%, 1.81963% 0.23084%)"
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Lock Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg width="16" height="20" viewBox="0 0 30 40" className="fill-white">
              <path d="M 12.519565,0 C 6.7072359,0 2.0282227,4.622895 2.0282227,10.365511 V 19.386852 C 0.81380849,20.12592 0,21.438885 0,22.957364 V 40 H 30 V 22.957364 C 30,21.444973 29.193452,20.135235 27.987171,19.394457 V 10.365511 C 27.987171,4.622895 23.308158,0 17.495831,0 Z M 12.519565,4.384239 H 17.495831 C 20.923632,4.384239 23.682489,7.111909 23.682489,10.498597 V 19.002803 H 6.3309823 V 10.498597 C 6.3309823,7.111909 9.091764,4.384239 12.519565,4.384239 Z" />
            </svg>
          </div>
          
          {/* Hidden Input */}
          <input
            ref={hiddenInputRef}
            type="password"
            value={value}
            onChange={handleHiddenInputChange}
            placeholder={placeholder}
            className="w-full h-full bg-transparent border-0 text-[#575cba] text-sm outline-none placeholder:text-muted-foreground"
          />
        </motion.div>

        {/* Revealed State */}
        <motion.div 
          className="absolute inset-0 bg-white flex items-center px-10 pr-12 pointer-events-none"
          animate={{
            clipPath: isRevealed 
              ? "polygon(2.28031% 0%, 14.21024% 0.00147%, 26.14016% 0%, 38.07008% 0.00147%, 50% 0%, 61.92992% 0.00147%, 73.85984% 0%, 85.78976% 0.00147%, 97.71969% 0%, 98.18037% 0.23084%, 98.60894% 0.89324%, 98.99635% 1.94205%, 99.33358% 3.33211%, 99.61159% 5.01825%, 99.82135% 6.95531%, 99.95383% 9.09814%, 100% 11.40157%, 100.00029% 21.05118%, 100% 30.70079%, 100.00029% 40.35039%, 100% 50%, 100.00029% 59.64961%, 100% 69.29921%, 100.00029% 78.94882%, 100% 88.59843%, 99.95383% 90.90186%, 99.82135% 93.04469%, 99.61159% 94.98175%, 99.33358% 96.66789%, 98.99635% 98.05795%, 98.60894% 99.10676%, 98.18037% 99.76916%, 97.71969% 100%, 85.78976% 100.00147%, 73.85984% 100%, 61.92992% 100.00147%, 50% 100%, 38.07008% 100.00147%, 26.14016% 100%, 14.21024% 100.00147%, 2.28031% 100%, 1.81963% 99.76916%, 1.39106% 99.10676%, 1.00365% 98.05795%, 0.66642% 96.66789%, 0.38841% 94.98175%, 0.17865% 93.04469%, 0.04617% 90.90186%, 0% 88.59843%, 0.00029% 78.94882%, 0% 69.29921%, 0.00029% 59.64961%, 0% 50%, 0.00029% 40.35039%, 0% 30.70079%, 0.00029% 21.05118%, 0% 11.40157%, 0.04617% 9.09814%, 0.17865% 6.95531%, 0.38841% 5.01825%, 0.66642% 3.33211%, 1.00365% 1.94205%, 1.39106% 0.89324%, 1.81963% 0.23084%)"
              : "polygon(85.39075% 28.16254%, 85.86161% 27.31304%, 86.33801% 26.7167%, 86.81675% 26.36695%, 87.29462% 26.25723%, 87.7684% 26.38091%, 88.23487% 26.73144%, 88.69081% 27.30221%, 89.13302% 28.08664%, 89.55826% 29.07816%, 89.96332% 30.27017%, 90.345% 31.6561%, 90.70007% 33.22935%, 91.02531% 34.98333%, 91.31751% 36.91147%, 91.57346% 39.00718%, 91.78992% 41.26386%, 91.95983% 43.6181%, 92.0791% 46.00012%, 92.14904% 48.39386%, 92.17099% 50.78321%, 92.14625% 53.15209%, 92.07615% 55.48444%, 91.96199% 57.76415%, 91.80511% 59.97518%, 91.6068% 62.10138%, 91.3684% 64.12672%, 91.09122% 66.0351%, 90.77657% 67.81044%, 90.42577% 69.43666%, 90.04014% 70.89766%, 89.621% 72.17737%, 89.16967% 73.25972%, 88.69881% 74.10923%, 88.22241% 74.70556%, 87.74366% 75.05532%, 87.26579% 75.16504%, 86.79201% 75.04135%, 86.32555% 74.69083%, 85.86961% 74.12006%, 85.4274% 73.33563%, 85.00216% 72.3441%, 84.59709% 71.15209%, 84.21541% 69.76616%, 83.86035% 68.19292%, 83.53511% 66.43893%, 83.2429% 64.51079%, 82.98696% 62.41508%, 82.77049% 60.1584%, 82.60059% 57.80416%, 82.48132% 55.42214%, 82.41137% 53.0284%, 82.38942% 50.63905%, 82.41416% 48.27017%, 82.48427% 45.93782%, 82.59843% 43.65811%, 82.75531% 41.4471%, 82.95362% 39.3209%, 83.19202% 37.29556%, 83.4692% 35.38717%, 83.78385% 33.61184%, 84.13465% 31.98561%, 84.52027% 30.5246%, 84.93942% 29.2449%)"
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Lock Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg width="16" height="20" viewBox="0 0 30 40" className="fill-black">
              <path d="M 12.519565,0 C 6.7072359,0 2.0282227,4.622895 2.0282227,10.365511 V 19.386852 C 0.81380849,20.12592 0,21.438885 0,22.957364 V 40 H 30 V 22.957364 C 30,21.444973 29.193452,20.135235 27.987171,19.394457 V 10.365511 C 27.987171,4.622895 23.308158,0 17.495831,0 Z M 12.519565,4.384239 H 17.495831 C 20.923632,4.384239 23.682489,7.111909 23.682489,10.498597 V 19.002803 H 6.3309823 V 10.498597 C 6.3309823,7.111909 9.091764,4.384239 12.519565,4.384239 Z" />
            </svg>
          </div>
          
          {/* Revealed Input */}
          <input
            ref={revealedInputRef}
            type="text"
            value={value}
            onChange={handleRevealedInputChange}
            placeholder={placeholder}
            className="w-full h-full bg-transparent border-0 text-foreground text-sm outline-none placeholder:text-muted-foreground"
          />
        </motion.div>

        {/* Eye Button */}
        <motion.button
          onClick={handleToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-transparent hover:bg-gray-100 flex items-center justify-center transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence mode="wait">
            {isRevealed ? (
              <motion.div
                key="eye-off"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.2 }}
              >
                <EyeOff className="w-4 h-4 text-[#575cba]" />
              </motion.div>
            ) : (
              <motion.div
                key="eye"
                initial={{ opacity: 0, rotateY: -90 }}
                animate={{ opacity: 1, rotateY: 0 }}
                exit={{ opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="w-4 h-4 text-[#575cba]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}; 