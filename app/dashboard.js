const dayKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

export function classifyOutreachForDashboard(assignment, assessment, conflicts = []) {
  if (assignment.inactive === true) return {status: 'inactive', reasons: []};
  const acknowledged = new Set(conflicts
    .filter(conflict => assignment.exception === true && (!assignment.exceptionNote || assignment.exceptionNote.includes(conflict.message)))
    .map(conflict => conflict.label));
  const reasons = assessment.reasons.filter(reason => !acknowledged.has(reason));
  const unavailable = (assessment.unavailableReasons || []).filter(reason => !acknowledged.has(reason));
  return {status: unavailable.length ? 'warning' : reasons.length ? 'pending' : 'complete', reasons};
}

function addDays(date, amount) {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  result.setDate(result.getDate() + amount);
  return result;
}

function selectMonthlyPrograms(programs = []) {
  const selected = new Map();
  for (const program of programs) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(program.month || '')) continue;
    const previous = selected.get(program.month);
    if (!previous || String(program.updatedAt || program.createdAt || '') > String(previous.updatedAt || previous.createdAt || '')) selected.set(program.month, program);
  }
  return selected;
}

export function createDashboardModel({db, today = new Date(), selectedDate = today, describePublic, describeOutreach, describePublicProgram, describeOutreachProgram}) {
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12);
  const todayKey = dayKey(todayDate);
  const selected = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 12);
  const selectedKey = dayKey(selected);
  const weekStart = addDays(selected, -((selected.getDay() + 6) % 7));
  const weekEnd = addDays(weekStart, 6);
  const upcomingEnd = addDays(todayDate, 6);
  const publicPrograms = selectMonthlyPrograms(db.programs);
  const outreachPrograms = selectMonthlyPrograms(db.outreach?.programs);
  const currentMonth = todayKey.slice(0, 7);
  const relevantMonths = new Set([currentMonth, ...Array.from({length: 7}, (_, offset) => dayKey(addDays(todayDate, offset)).slice(0, 7)), ...Array.from({length: 7}, (_, offset) => dayKey(addDays(weekStart, offset)).slice(0, 7))]);
  const activities = [];
  for (const month of relevantMonths) {
    const publicProgram = publicPrograms.get(month);
    if (publicProgram) for (const assignment of publicProgram.assignments || []) {
      if (assignment.unassignedAccepted === true) continue;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(assignment.date || '')) continue;
      activities.push(describePublic(publicProgram, assignment));
    }
    const outreachProgram = outreachPrograms.get(month);
    if (outreachProgram) for (const assignment of outreachProgram.assignments || []) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(assignment.date || '')) continue;
      activities.push(describeOutreach(outreachProgram, assignment));
    }
  }
  const sorted = activities.filter(Boolean).sort((left, right) => left.date.localeCompare(right.date) || left.time.localeCompare(right.time) || left.module.localeCompare(right.module));
  const scheduled = sorted.filter(item => item.status !== 'inactive');
  const todayActivities = scheduled.filter(item => item.date === todayKey);
  const upcomingActivities = scheduled.filter(item => item.date >= todayKey && item.date <= dayKey(upcomingEnd));
  const monthEnd = dayKey(new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0, 12));
  const attentionEnd = monthEnd > dayKey(upcomingEnd) ? monthEnd : dayKey(upcomingEnd);
  const attentionItems = scheduled.filter(item => item.date >= todayKey && item.date <= attentionEnd && ['pending', 'warning', 'exception'].includes(item.status))
    .sort((left, right) => left.date.localeCompare(right.date)
      || (left.status === 'pending' ? 1 : 0) - (right.status === 'pending' ? 1 : 0)
      || left.time.localeCompare(right.time));
  const weekDays = Array.from({length: 7}, (_, offset) => {
    const date = addDays(weekStart, offset);
    const dateKey = dayKey(date);
    return {date: dateKey, count: scheduled.filter(item => item.date === dateKey).length, isToday: dateKey === todayKey};
  });
  const currentPublic = publicPrograms.get(currentMonth);
  const currentOutreach = outreachPrograms.get(currentMonth);
  return {
    todayKey,
    selectedKey,
    currentMonth,
    weekDays,
    todayActivities,
    selectedActivities: scheduled.filter(item => item.date === selectedKey),
    upcomingActivities,
    weekActivities: scheduled.filter(item => item.date >= dayKey(weekStart) && item.date <= dayKey(weekEnd)),
    attentionItems,
    counts: {
      today: todayActivities.length,
      upcoming: upcomingActivities.length,
      pending: attentionItems.filter(item => item.status === 'pending').length,
      warnings: attentionItems.filter(item => item.status === 'warning' || item.status === 'exception').length
    },
    programs: [
      currentPublic ? describePublicProgram(currentPublic) : {module: 'public', missing: true, month: currentMonth},
      currentOutreach ? describeOutreachProgram(currentOutreach) : {module: 'outreach', missing: true, month: currentMonth}
    ],
    configuration: {
      participants: (db.participants || []).filter(item => item.active).length,
      turns: (db.turns || []).filter(item => item.active).length,
      resources: (db.resources || []).filter(item => item.active).length,
      outreachRules: (db.outreach?.rules || []).filter(item => item.active).length
    },
    recentChanges: (db.logs || []).slice(0, 4),
    dataUpdatedAt: db.meta?.dataUpdatedAt || ''
  };
}
