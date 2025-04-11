/**
 * SSR分析器 - 用于分析DNA序列中的简单重复序列(Simple Sequence Repeats)
 */

/**
 * 解析FASTA格式的序列
 * @param {string} fastaContent - FASTA格式的序列内容
 * @returns {Object} 包含序列ID和序列内容的对象
 */
export const parseFasta = (fastaContent) => {
    const sequences = {};
    let currentId = '';
    let currentSeq = [];
  
    // 按行分割FASTA内容
    const lines = fastaContent.split('\n');
  
    for (let line of lines) {
      line = line.trim();
      if (!line) continue; // 跳过空行
  
      if (line.startsWith('>')) {
        // 如果已经有序列，保存之前的序列
        if (currentId && currentSeq.length > 0) {
          sequences[currentId] = currentSeq.join('');
        }
        // 开始新序列，提取序列ID
        currentId = line.substring(1).trim().split(' ')[0];
        currentSeq = [];
      } else {
        // 添加序列内容（去除空格和非序列字符）
        currentSeq.push(line.replace(/\s+/g, ''));
      }
    }
  
    // 保存最后一个序列
    if (currentId && currentSeq.length > 0) {
      sequences[currentId] = currentSeq.join('');
    }
  
    return sequences;
  };
  
  /**
   * 查找序列中的简单重复序列(SSR)
   * @param {string} sequence - DNA序列
   * @param {Object} params - 查找参数
   * @returns {Array} SSR结果数组
   */
  export const findSSRs = (sequence, params) => {
    const {
      minRepeatLength = 1,
      maxRepeatLength = 6,
      minRepeatCount = 3,
      minTandemLength = 10,
      mismatchPercentage = 0
    } = params;
  
    const results = [];
    const sequenceLength = sequence.length;
    let ssrId = 1;
  
    // 对每种可能的重复单位长度进行搜索
    for (let motifLength = minRepeatLength; motifLength <= maxRepeatLength; motifLength++) {
      // 滑动窗口搜索潜在的重复单位
      for (let i = 0; i <= sequenceLength - motifLength; i++) {
        const motif = sequence.substring(i, i + motifLength);
        let j = i + motifLength;
        let repeatCount = 1;
        let mismatchCount = 0;
        const maxMismatches = Math.floor((motifLength * mismatchPercentage) / 100);
  
        // 检查后续序列是否重复该单位
        while (j <= sequenceLength - motifLength) {
          const nextMotif = sequence.substring(j, j + motifLength);
          let currentMismatches = 0;
  
          // 计算错配数
          for (let k = 0; k < motifLength; k++) {
            if (motif[k] !== nextMotif[k]) {
              currentMismatches++;
            }
          }
  
          // 如果错配数在允许范围内，认为是重复
          if (currentMismatches <= maxMismatches) {
            repeatCount++;
            mismatchCount += currentMismatches;
            j += motifLength;
          } else {
            break;
          }
        }
  
        // 如果重复次数和总长度满足条件，记录该SSR
        const ssrLength = repeatCount * motifLength;
        if (repeatCount >= minRepeatCount && ssrLength >= minTandemLength) {
          const ssrType = getSSRType(motifLength);
          results.push({
            key: ssrId,
            id: `SSR${ssrId}`,
            type: ssrType,
            motif,
            start: i + 1, // 转为1-based坐标
            end: i + ssrLength,
            length: ssrLength,
            repeatCount,
            mismatchCount
          });
          ssrId++;
          
          // 跳过已找到的SSR区域
          i = i + ssrLength - 1;
        }
      }
    }
  
    return results;
  };
  
  /**
   * 根据重复单位长度获取SSR类型名称
   * @param {number} motifLength - 重复单位长度
   * @returns {string} SSR类型名称
   */
  const getSSRType = (motifLength) => {
    const typeMap = {
      1: '单核苷酸',
      2: '二核苷酸',
      3: '三核苷酸',
      4: '四核苷酸',
      5: '五核苷酸',
      6: '六核苷酸'
    };
    return typeMap[motifLength] || `${motifLength}核苷酸`;
  };
  
  /**
   * 计算SSR统计信息
   * @param {Array} ssrData - SSR结果数组
   * @param {number} sequenceLength - 序列总长度
   * @returns {Object} 统计信息对象
   */
  export const calculateStatistics = (ssrData, sequenceLength) => {
    const typeCounts = {
      '单核苷酸': 0,
      '二核苷酸': 0,
      '三核苷酸': 0,
      '四核苷酸': 0,
      '五核苷酸': 0,
      '六核苷酸': 0
    };
  
    // 计算各类型SSR的数量
    ssrData.forEach(ssr => {
      if (typeCounts[ssr.type] !== undefined) {
        typeCounts[ssr.type]++;
      }
    });
  
    // 计算SSR密度（每千碱基的SSR数量）
    const density = (ssrData.length / sequenceLength * 1000).toFixed(2);
  
    return {
      totalSSRs: ssrData.length,
      typeCounts,
      sequenceLength,
      density
    };
  };
  
  /**
   * 分析序列中的SSR
   * @param {string} sequenceData - FASTA格式的序列或纯序列
   * @param {Object} params - 分析参数
   * @returns {Object} 分析结果
   */
  export const analyzeSSR = (sequenceData, params) => {
    let sequences = {};
    let isFasta = false;
  
    // 检查是否为FASTA格式
    if (sequenceData.trim().startsWith('>')) {
      sequences = parseFasta(sequenceData);
      isFasta = true;
    } else {
      // 纯序列，去除空白字符
      sequences = { 'Sequence': sequenceData.replace(/\s+/g, '') };
    }
  
    let allSSRs = [];
    let totalLength = 0;
  
    // 处理每个序列
    for (const [id, sequence] of Object.entries(sequences)) {
      const sequenceSSRs = findSSRs(sequence, params);
      // 添加序列ID信息
      sequenceSSRs.forEach(ssr => {
        ssr.sequenceId = id;
      });
      allSSRs = [...allSSRs, ...sequenceSSRs];
      totalLength += sequence.length;
    }
  
    // 计算统计信息
    const statistics = calculateStatistics(allSSRs, totalLength);
  
    return {
      ssrData: allSSRs,
      statistics,
      sequenceCount: Object.keys(sequences).length,
      isFasta
    };
  };