import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Scale, Ruler, Activity, TrendingDown, Save } from 'lucide-react';

interface BodyMeasurementFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

const BodyMeasurementForm: React.FC<BodyMeasurementFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    weight: '',
    height: '',
    bodyFatPercentage: '',
    skeletalMuscleMass: '',
    bmr: '',
    waistCircumference: '',
    hipCircumference: '',
    chestCircumference: '',
    armCircumference: '',
    thighCircumference: '',
    measurementDate: new Date().toISOString().split('T')[0],
    measurementLocation: '',
    measurementDevice: '',
    notes: '',
  });

  const [calculatedBMI, setCalculatedBMI] = useState<number | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // BMI 자동 계산
    if (name === 'weight' || name === 'height') {
      const weight = name === 'weight' ? parseFloat(value) : parseFloat(formData.weight);
      const height = name === 'height' ? parseFloat(value) : parseFloat(formData.height);

      if (weight && height) {
        const heightInMeters = height / 100;
        const bmi = weight / (heightInMeters * heightInMeters);
        setCalculatedBMI(parseFloat(bmi.toFixed(1)));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: '저체중', color: 'text-blue-400' };
    if (bmi < 23) return { text: '정상', color: 'text-green-400' };
    if (bmi < 25) return { text: '과체중', color: 'text-yellow-400' };
    if (bmi < 30) return { text: '비만', color: 'text-orange-400' };
    return { text: '고도비만', color: 'text-red-400' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-purple-500/30">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <Activity className="text-purple-400" size={32} />
          신체 측정 기록
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 기본 측정 */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Scale size={18} className="text-purple-400" />
                체중 (kg) *
              </label>
              <input
                type="number"
                step="0.1"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="70.5"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                <Ruler size={18} className="text-purple-400" />
                신장 (cm)
              </label>
              <input
                type="number"
                step="0.1"
                name="height"
                value={formData.height}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="175.0"
              />
            </div>
          </div>

          {/* BMI 표시 */}
          {calculatedBMI && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-500/20 border border-purple-500/50 rounded-xl p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300">계산된 BMI:</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-purple-400">
                    {calculatedBMI}
                  </span>
                  <span
                    className={`ml-3 text-sm font-semibold ${
                      getBMICategory(calculatedBMI).color
                    }`}
                  >
                    {getBMICategory(calculatedBMI).text}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* 인바디 데이터 */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">
              인바디 데이터 (선택사항)
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  체지방률 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="bodyFatPercentage"
                  value={formData.bodyFatPercentage}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="20.5"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  골격근량 (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="skeletalMuscleMass"
                  value={formData.skeletalMuscleMass}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="30.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  기초대사량 (kcal)
                </label>
                <input
                  type="number"
                  name="bmr"
                  value={formData.bmr}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="1650"
                />
              </div>
            </div>
          </div>

          {/* 둘레 측정 */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">
              둘레 측정 (선택사항)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  허리둘레 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="waistCircumference"
                  value={formData.waistCircumference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="80.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  엉덩이둘레 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="hipCircumference"
                  value={formData.hipCircumference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="95.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  가슴둘레 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="chestCircumference"
                  value={formData.chestCircumference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="100.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  팔둘레 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="armCircumference"
                  value={formData.armCircumference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="32.0"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  허벅지둘레 (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="thighCircumference"
                  value={formData.thighCircumference}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="55.0"
                />
              </div>
            </div>
          </div>

          {/* 측정 정보 */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-400">
              측정 정보
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  측정 날짜
                </label>
                <input
                  type="date"
                  name="measurementDate"
                  value={formData.measurementDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  측정 장소
                </label>
                <input
                  type="text"
                  name="measurementLocation"
                  value={formData.measurementLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="헬스장, 집, 보건소 등"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  측정 기기
                </label>
                <input
                  type="text"
                  name="measurementDevice"
                  value={formData.measurementDevice}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                  placeholder="InBody 770, 샤오미 체성분계 등"
                />
              </div>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              메모 (선택사항)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
              placeholder="오늘 컨디션, 특이사항 등을 기록하세요"
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 justify-end pt-4">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 bg-gray-700 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
            >
              <Save size={20} />
              저장하기
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default BodyMeasurementForm;
