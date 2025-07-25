import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './PersonaliseCorrection.css';

const PAGE_SIZE = 6;

const HistoryDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const historyDetails = location.state?.historyDetails || [];
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(historyDetails.length / PAGE_SIZE);
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const endIdx = startIdx + PAGE_SIZE;
  const pageData = historyDetails.slice(startIdx, endIdx);

  return (
    <div className="personalise-container">
      <h2>History Details</h2>
      <div className="practice-mode">
        {historyDetails.length === 0 ? (
          <div className="no-data">No history available</div>
        ) : (
          <ol style={{paddingLeft: '20px', color: '#333', fontSize: '1rem', margin: 0}}>
            {pageData.map((item, idx) => (
              <li key={item.id || startIdx + idx} style={{marginBottom: '18px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'10px'}}>
                  <span><b>Q{startIdx + idx + 1}:</b> {item.question || <span style={{color:'#aaa'}}>No question</span>}</span>
                  {item.created_at && (
                    <span style={{fontSize:'0.92em',color:'#888',whiteSpace:'nowrap'}}>Time: {new Date(item.created_at).toLocaleString()}</span>
                  )}
                </div>
                {item.answer && (
                  <div style={{marginTop: 4}}><b>AI Answer:</b> {item.answer}</div>
                )}
                {item.correction && (
                  <div style={{marginTop: 4, color: '#28a745'}}><b>Corrected:</b> {item.correction}</div>
                )}
              </li>
            ))}
          </ol>
        )}
        {/* 分页控件 */}
        {historyDetails.length > PAGE_SIZE && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:'16px',marginTop:'24px'}}>
            <button className="practice-btn" onClick={()=>setCurrentPage(p=>p-1)} disabled={currentPage===1}>Previous</button>
            <span style={{fontSize:'1.05em'}}>Page {currentPage} / {totalPages}</span>
            <button className="practice-btn" onClick={()=>setCurrentPage(p=>p+1)} disabled={currentPage===totalPages}>Next</button>
          </div>
        )}
        <button className="practice-btn" style={{marginTop: 32}} onClick={() => navigate(-1)}>Back</button>
      </div>
    </div>
  );
};

export default HistoryDetails; 