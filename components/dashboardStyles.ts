export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');

.kd-root {
  --navy: #0B1E33;
  --navy-2: #142C47;
  --paper: #F5F6F4;
  --paper-2: #FFFFFF;
  --steel: #3E6E8E;
  --steel-light: #DCE7ED;
  --gold: #B8923B;
  --gold-light: #F3E9D2;
  --slate: #5B6570;
  --line: #DDE1E3;
  --red: #9B3A3A;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: var(--navy);
  background: var(--paper);
  min-height: 100dvh;
}
.kd-root * { box-sizing: border-box; }

.kd-masthead {
  background: linear-gradient(180deg, var(--navy) 0%, var(--navy-2) 100%);
  color: #F2F4F6;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.kd-eyebrow {
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  font-size: 11px;
  color: #9FB3C8;
  margin-bottom: 4px;
}
.kd-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: 0.01em;
  margin: 0 0 4px 0;
}
.kd-subtitle { margin: 0; font-size: 13px; color: #B7C4D1; }

.kd-masthead-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }

.kd-scoreboard {
  background: rgba(0,0,0,0.28);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  padding: 10px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 190px;
}
.kd-scoreboard-label {
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 10px;
  color: #C9D3DC;
}
.kd-scoreboard-digits {
  font-family: 'IBM Plex Mono', monospace;
  font-weight: 600;
  font-size: 38px;
  line-height: 1;
  letter-spacing: 0.04em;
  color: #F0C15B;
  font-variant-numeric: tabular-nums;
}
.kd-scoreboard-btn {
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  color: #D6DEE6;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.22);
  border-radius: 5px;
  padding: 4px 9px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
}
.kd-scoreboard-btn:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
.kd-scoreboard-btn:disabled { opacity: 0.4; cursor: default; }

.kd-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 28px;
  background: var(--steel-light);
  color: #22506B;
  font-size: 12.5px;
  border-bottom: 1px solid var(--line);
}
.kd-banner-error {
  background: #F3E0DF;
  color: var(--red);
  justify-content: space-between;
}
.kd-banner-close { background: none; border: none; cursor: pointer; color: inherit; display: flex; }

.kd-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--line);
  background: var(--paper-2);
}
.kd-search {
  display: flex;
  align-items: center;
  gap: 7px;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: 7px;
  padding: 7px 11px;
  flex: 1;
  min-width: 200px;
  color: var(--slate);
}
.kd-search input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  width: 100%;
  color: var(--navy);
  font-family: 'Inter', sans-serif;
}

.kd-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px;
  font-weight: 500;
  padding: 8px 13px;
  border-radius: 7px;
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--navy);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
}
.kd-btn-ghost:hover { background: var(--paper); }
.kd-btn-primary { background: var(--navy); color: #F2F4F6; border-color: var(--navy); }
.kd-btn-primary:hover { background: var(--navy-2); }
.kd-btn-primary:disabled { opacity: 0.4; cursor: default; }
.kd-btn-disabled { opacity: 0.45; cursor: default; }
.kd-spin { animation: kd-spin 1s linear infinite; }
@keyframes kd-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.kd-view-toggle { display: flex; border: 1px solid var(--line); border-radius: 7px; overflow: hidden; }
.kd-view-toggle button {
  border: none; background: var(--paper-2); padding: 8px 10px; cursor: pointer; color: var(--slate);
  display: flex;
}
.kd-view-toggle button.active { background: var(--navy); color: #fff; }

.kd-save-state { font-size: 11px; color: var(--slate); margin-left: auto; min-width: 90px; text-align: right; }

.kd-filters {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 28px;
  background: var(--paper);
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}
.kd-filter { display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: var(--slate); }
.kd-filter select {
  font-family: 'Inter', sans-serif;
  font-size: 12.5px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid var(--line);
  background: var(--paper-2);
  color: var(--navy);
}
.kd-checkbox { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: var(--slate); }

.kd-main { padding: 22px 28px 28px; min-height: 200px; }

.kd-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--slate);
  font-size: 13.5px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.kd-empty-title { font-weight: 600; color: var(--navy); font-size: 15px; margin: 0; }

.kd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 14px;
}

.kd-card {
  background: var(--paper-2);
  border: 1px solid var(--line);
  border-top: 3px solid var(--accent, var(--slate));
  border-radius: 9px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.kd-card-new { box-shadow: 0 1px 0 rgba(184,146,58,0.4); }
.kd-card-top { padding: 14px 16px 10px; cursor: pointer; }
.kd-card-badges { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.kd-badge {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 10.5px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  background: #E7E8EA;
  border: 1px solid transparent;
}
.kd-card-title { font-size: 15.5px; font-weight: 600; margin: 0 0 2px 0; color: var(--navy); }
.kd-card-club { font-size: 13px; color: var(--slate); margin-bottom: 6px; }
.kd-card-meta { font-size: 11.5px; color: var(--slate); display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.kd-dot { opacity: 0.5; }
.kd-card-resume { font-size: 12.5px; color: #414B55; line-height: 1.5; margin: 0; }

.kd-card-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border-top: 1px solid var(--line);
  flex-wrap: wrap;
}
.kd-status-select {
  font-family: 'Inter', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  border: none;
  border-radius: 5px;
  padding: 6px 8px;
  cursor: pointer;
}
.kd-status-select-sm { padding: 4px 6px; font-size: 11px; }

.kd-icon-btn {
  border: 1px solid var(--line);
  background: var(--paper-2);
  border-radius: 6px;
  padding: 6px;
  display: flex;
  cursor: pointer;
  color: var(--slate);
}
.kd-icon-btn:hover { background: var(--paper); }
.kd-icon-btn-danger:hover { background: #F3E0DF; color: var(--red); }

.kd-card-note {
  padding: 10px 16px 14px;
  border-top: 1px dashed var(--line);
  background: var(--paper);
}
.kd-card-note label { font-size: 11px; color: var(--slate); display: block; margin-bottom: 4px; }
.kd-card-note textarea {
  width: 100%;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px;
  border: 1px solid var(--line);
  border-radius: 6px;
  padding: 8px;
  resize: vertical;
  color: var(--navy);
}
.kd-card-note-meta { font-size: 11px; color: var(--slate); margin-top: 6px; }

.kd-table-wrap { overflow-x: auto; }
.kd-table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.kd-table th {
  text-align: left;
  font-family: 'Barlow Condensed', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 11px;
  color: var(--slate);
  padding: 8px 10px;
  border-bottom: 2px solid var(--line);
}
.kd-table td { padding: 9px 10px; border-bottom: 1px solid var(--line); color: var(--navy); }
.kd-row-new { background: #FBF7EE; }
.kd-td-title { font-weight: 600; }
.kd-mono { font-family: 'IBM Plex Mono', monospace; font-size: 11.5px; color: var(--slate); }
.kd-table-note { font-size: 11px; color: var(--slate); margin-top: 8px; }

.kd-modal-overlay {
  position: fixed; inset: 0; background: rgba(11,30,51,0.55);
  display: flex; align-items: center; justify-content: center; z-index: 50; padding: 20px;
}
.kd-modal {
  background: var(--paper-2); border-radius: 12px; width: 100%; max-width: 520px;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}
.kd-modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid var(--line);
}
.kd-modal-head h2 { font-family: 'Barlow Condensed', sans-serif; font-size: 19px; margin: 0; font-weight: 600; }
.kd-modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.kd-field { display: flex; flex-direction: column; gap: 4px; font-size: 11.5px; color: var(--slate); flex: 1; }
.kd-field input, .kd-field select, .kd-field textarea {
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--line);
  color: var(--navy);
}
.kd-field-row { display: flex; gap: 12px; flex-wrap: wrap; }
.kd-modal-foot {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 20px; border-top: 1px solid var(--line);
}

.kd-footer {
  padding: 14px 28px 20px;
  font-size: 11px;
  color: var(--slate);
  border-top: 1px solid var(--line);
  line-height: 1.6;
}

@media (max-width: 640px) {
  .kd-masthead { flex-direction: column; align-items: flex-start; }
  .kd-toolbar { flex-direction: column; align-items: stretch; }
  .kd-save-state { text-align: left; margin-left: 0; }
}
`;
