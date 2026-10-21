/**
 * ARIMA MANAGEMENT SYSTEM - FINAL BACKEND
 * Deploy as Google Apps Script Web App.
 */
const ARIMA = Object.freeze({
  SPREADSHEET_ID: '1hsfZFAS24iI6w2dQRONgOhg2j7WCa-_OcJRFG9zDKOw',
  TIMEZONE: 'Asia/Jakarta',
  TOKEN_TTL_MS: 60 * 60 * 1000,
  LOGIN_MAX_FAILS: 5,
  LOGIN_LOCK_SECONDS: 15 * 60
});

function doGet() {
  return json_(health_());
}

const WRITE_ACTIONS_ = Object.freeze([
  'assignStudentIds', 'assignSenseiIds', 'selfAttendance', 'generateUserIds',
  'userCreate', 'userReset', 'userDelete',
  'studentSave', 'studentDelete', 'senseiSave', 'senseiDelete',
  'attendanceSave', 'billingSave', 'billingDelete',
  'paymentSave', 'paymentDelete',
  'financeSave', 'salarySave', 'salaryDelete', 'salaryEmail',
  'attendancePhotoUpload', 'fileUpload'
]);

function doPost(e) {
  let lock = null;
  try {
    const body = JSON.parse(String(e && e.postData && e.postData.contents ? e.postData.contents : '{}'));
    const action = body && body.action ? body.action : 'health';
    const payload = body && body.payload ? body.payload : {};
    if (WRITE_ACTIONS_.indexOf(String(action)) >= 0) {
      lock = LockService.getScriptLock();
      lock.waitLock(20000);
    }
    return json_(route_(action, payload, body && body.token));
  } catch (err) {
    return json_({ success: false, message: String(err && err.message ? err.message : err) });
  } finally {
    if (lock) {
      try { lock.releaseLock(); } catch (ignore) { /* lock already released */ }
    }
  }
}

function route_(action, p, token) {
  switch (String(action || '')) {
    case 'health':
      return health_();
    case 'login':
      return login_(p);
    case 'logout':
      return logout_();
    case 'dashboard':
      const dashboardAccessError = roleAccessError_(token, ['ADMIN', 'SENSEI', 'SISWA']);
      if (dashboardAccessError) return dashboardAccessError;
      return dashboard_();
    case 'students':
      const studentsAccessError = roleAccessError_(token, ['ADMIN']);
      if (studentsAccessError) return studentsAccessError;
      return listSheet_('STUDENTS');
    case 'assignStudentIds':
      const assignStudentIdsAccessError = accountAccessError_(token);
      if (assignStudentIdsAccessError) return assignStudentIdsAccessError;
      return assignMissingStudentIds_();
    case 'assignSenseiIds':
      const assignSenseiIdsAccessError = accountAccessError_(token);
      if (assignSenseiIdsAccessError) return assignSenseiIdsAccessError;
      return assignMissingSenseiIds_();
    case 'sensei':
      const senseiAccessError = roleAccessError_(token, ['ADMIN']);
      if (senseiAccessError) return senseiAccessError;
      return senseiList_(token);
    case 'attendance':
      const attendanceAccessError = accountAccessError_(token);
      if (attendanceAccessError) return attendanceAccessError;
      return listSheet_('ATTENDANCE');
    case 'attendanceProfile':
      const attendanceProfileAccessError = attendanceRoleError_(token);
      if (attendanceProfileAccessError) return attendanceProfileAccessError;
      return attendanceProfile_(token);
    case 'selfAttendance':
      const selfAttendanceAccessError = attendanceRoleError_(token);
      if (selfAttendanceAccessError) return selfAttendanceAccessError;
      return saveOwnAttendance_(p, token);
    case 'billing':
      const billingAccessError = accountAccessError_(token);
      if (billingAccessError) return billingAccessError;
      return listSheet_('BILLING');
    case 'payments':
      const paymentsAccessError = accountAccessError_(token);
      if (paymentsAccessError) return paymentsAccessError;
      return listSheet_('PAYMENTS');
    case 'finance':
      const financeAccessError = accountAccessError_(token);
      if (financeAccessError) return financeAccessError;
      return financeRecords_();
    case 'salary':
      const salaryAccessError = salaryAccessError_(token);
      if (salaryAccessError) return salaryAccessError;
      return listSheet_('SALARY');
    case 'salaryPreview':
      const salaryPreviewAccessError = salaryAccessError_(token);
      if (salaryPreviewAccessError) return salaryPreviewAccessError;
      return calculateSalaryRecord_(p || {});
    case 'users':
      const usersAccessError = accountAccessError_(token);
      if (usersAccessError) return usersAccessError;
      return listAccounts_();
    case 'generateUserIds':
      const generateUserIdsAccessError = accountAccessError_(token);
      if (generateUserIdsAccessError) return generateUserIdsAccessError;
      return generateUserIds_();
    case 'userCreate':
      const userCreateAccessError = accountAccessError_(token);
      if (userCreateAccessError) return userCreateAccessError;
      return createAccount_(p);
    case 'userReset':
      const userResetAccessError = accountAccessError_(token);
      if (userResetAccessError) return userResetAccessError;
      return resetAccountPassword_(p);
    case 'userDelete':
      const userDeleteAccessError = accountAccessError_(token);
      if (userDeleteAccessError) return userDeleteAccessError;
      return deleteAccount_(p, token);
    case 'studentSave':
      const studentSaveAccessError = roleAccessError_(token, ['ADMIN']);
      if (studentSaveAccessError) return studentSaveAccessError;
      return saveSheetRecord_('STUDENTS', 'ID_SISWA', p);
    case 'studentDelete':
      const studentDeleteAccessError = roleAccessError_(token, ['ADMIN']);
      if (studentDeleteAccessError) return studentDeleteAccessError;
      return deleteSheetRecord_('STUDENTS', 'ID_SISWA', p);
    case 'senseiSave':
      const senseiSaveAccessError = roleAccessError_(token, ['ADMIN']);
      if (senseiSaveAccessError) return senseiSaveAccessError;
      return saveSenseiRecord_(p, token);
    case 'senseiDelete':
      const senseiDeleteAccessError = roleAccessError_(token, ['ADMIN']);
      if (senseiDeleteAccessError) return senseiDeleteAccessError;
      return deleteSheetRecord_('SENSEI', 'ID_SENSEI', p);
    case 'attendanceSave':
      const attendanceSaveAccessError = accountAccessError_(token);
      if (attendanceSaveAccessError) return attendanceSaveAccessError;
      return saveSheetRecord_('ATTENDANCE', 'ATTENDANCE_ID', p);
    case 'billingSave':
      const billingSaveAccessError = accountAccessError_(token);
      if (billingSaveAccessError) return billingSaveAccessError;
      return saveSheetRecord_('BILLING', 'BILLING_ID', p);
    case 'paymentSave':
      const paymentSaveAccessError = accountAccessError_(token);
      if (paymentSaveAccessError) return paymentSaveAccessError;
      return saveSheetRecord_('PAYMENTS', 'PAYMENT_ID', p);
    case 'paymentDelete':
      const paymentDeleteAccessError = accountAccessError_(token);
      if (paymentDeleteAccessError) return paymentDeleteAccessError;
      return deletePaymentRecord_(p);
    case 'billingDelete':
      const billingDeleteAccessError = accountAccessError_(token);
      if (billingDeleteAccessError) return billingDeleteAccessError;
      return deleteBillingRecord_(p);
    case 'salaryDelete':
      const salaryDeleteAccessError = salaryAccessError_(token);
      if (salaryDeleteAccessError) return salaryDeleteAccessError;
      return deleteSheetRecord_('SALARY', 'SALARY_ID', p);
    case 'salaryEmail':
      const salaryEmailAccessError = salaryAccessError_(token);
      if (salaryEmailAccessError) return salaryEmailAccessError;
      return emailSalarySlip_(p);
    case 'financeSave':
      const financeSaveAccessError = accountAccessError_(token);
      if (financeSaveAccessError) return financeSaveAccessError;
      const financeSheetResult = financeSheet_();
      if (!financeSheetResult.success) return financeSheetResult;
      return saveSheetRecord_('FINANCE', 'TRANSACTION_ID', p);
    case 'salarySave':
      const salarySaveAccessError = salaryAccessError_(token);
      if (salarySaveAccessError) return salarySaveAccessError;
      return saveSheetRecord_('SALARY', 'SALARY_ID', p);
    case 'attendancePhotoUpload':
      const photoAccessError = attendanceRoleError_(token);
      if (photoAccessError) return photoAccessError;
      return uploadAttendancePhoto_(p);
    case 'fileUpload':
      const fileAccessError = roleAccessError_(token, ['ADMIN']);
      if (fileAccessError) return fileAccessError;
      return uploadFile_(p);
    default:
      return { success: false, message: 'Unknown action: ' + action };
  }
}

function ss_() {
  return SpreadsheetApp.openById(ARIMA.SPREADSHEET_ID);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function health_() {
  return { success: true, app: 'ARIMA MANAGEMENT SYSTEM', status: 'online' };
}

function logout_() {
  return { success: true, message: 'Logout berhasil.' };
}

function tokenUser_(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 2) return null;

  try {
    const payloadText = Utilities.newBlob(Utilities.base64Decode(parts[0])).getDataAsString('UTF-8');
    const expectedSignature = toBase64Url_(Utilities.computeHmacSha256Signature(payloadText, buildTokenSecret_()));
    if (!safeEqual_(parts[1], expectedSignature)) return null;
    const payload = JSON.parse(payloadText);
    if (!payload.id || Number(payload.exp) <= Date.now()) return null;
    return payload;
  } catch (error) {
    return null;
  }
}

function isAdminToken_(token) {
  const user = tokenUser_(token);
  return String(user && user.role || '').trim().toUpperCase() === 'ADMIN';
}

function adminOnlyResponse_() {
  return { success: false, code: 'FORBIDDEN', message: 'Data payroll hanya dapat diakses oleh admin.' };
}

function roleAccessError_(token, allowedRoles) {
  const user = tokenUser_(token);
  if (!user) {
    return { success: false, code: 'AUTH_REQUIRED', message: 'Sesi login perlu diperbarui. Silakan login kembali.' };
  }
  const role = String(user.role || '').trim().toUpperCase();
  if (allowedRoles.indexOf(role) < 0) {
    return { success: false, code: 'FORBIDDEN', message: 'Anda tidak memiliki akses untuk tindakan ini.' };
  }
  return null;
}

function accountAccessError_(token) {
  const user = tokenUser_(token);
  if (!user) {
    return { success: false, code: 'AUTH_REQUIRED', message: 'Sesi login perlu diperbarui. Silakan login kembali.' };
  }
  if (String(user.role || '').trim().toUpperCase() !== 'ADMIN') {
    return { success: false, code: 'FORBIDDEN', message: 'Pengelolaan akun hanya dapat dilakukan admin.' };
  }
  return null;
}

function attendanceRoleError_(token) {
  const user = tokenUser_(token);
  if (!user) return { success: false, code: 'AUTH_REQUIRED', message: 'Silakan login kembali ke aplikasi absensi.' };
  const role = String(user.role || '').trim().toUpperCase();
  if (role !== 'SISWA' && role !== 'SENSEI') {
    return { success: false, code: 'FORBIDDEN', message: 'Aplikasi absensi ini hanya untuk siswa dan sensei.' };
  }
  return null;
}

function accountSheetMeta_() {
  const workbook = ss_();
  let sheet = workbook.getSheetByName('USERS');
  if (!sheet) sheet = workbook.insertSheet('USERS');

  let values = sheet.getDataRange().getValues();
  if (!values.length || !values[0].some(function (cell) { return String(cell || '').trim(); })) {
    const headers = ['ID', 'NAMA', 'ROLE', 'SALT', 'PASSWORD_HASH', 'CREATED_AT', 'UPDATED_AT'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    values = sheet.getDataRange().getValues();
  }

  let headers = values[0].map(function (header) { return String(header || '').trim(); });
  let masterIdIndex = findColumnIndex_(headers, ['MASTER_ID', 'ID_MASTER', 'LINKED_ID']);
  if (masterIdIndex < 0) {
    masterIdIndex = sheet.getLastColumn() + 1;
    sheet.getRange(1, masterIdIndex).setValue('MASTER_ID');
    values = sheet.getDataRange().getValues();
    headers = values[0].map(function (header) { return String(header || '').trim(); });
  }

  const columns = {
    id: findColumnIndex_(headers, ['USER_ID', 'ID_USER', 'ID']),
    name: findColumnIndex_(headers, ['NAME', 'NAMA']),
    role: findColumnIndex_(headers, ['ROLE']),
    salt: findColumnIndex_(headers, ['PASSWORD_SALT', 'SALT']),
    hash: findColumnIndex_(headers, ['PASSWORD_HASH', 'PASSWORDHASH']),
    masterId: findColumnIndex_(headers, ['MASTER_ID', 'ID_MASTER', 'LINKED_ID'])
  };
  if (Object.keys(columns).some(function (key) { return columns[key] < 0; })) {
    return { success: false, message: 'Header USERS harus memiliki ID, NAMA, ROLE, SALT, dan PASSWORD_HASH.' };
  }

  return { success: true, sheet: sheet, values: values, headers: headers, columns: columns };
}

function listAccounts_() {
  const meta = accountSheetMeta_();
  if (!meta.success) return meta;

  const data = meta.values.slice(1).map(function (row, index) {
    const id = String(row[meta.columns.id] || '').trim();
    if (!id) return null;
    return {
      USER_ID: id,
      NAMA: String(row[meta.columns.name] || id),
      ROLE: String(row[meta.columns.role] || 'USER'),
      MASTER_ID: String(row[meta.columns.masterId] || ''),
      __ROW_NUMBER: index + 2
    };
  }).filter(function (user) { return !!user; });

  return { success: true, data: data };
}

function generateUserIds_() {
  const meta = accountSheetMeta_();
  if (!meta.success) return meta;
  const result = migrateLinkedAccountIds_(meta);
  if (!result.success) return result;
  const message = result.changed
    ? result.changed + ' USER ID siswa/sensei berhasil dibuat atau diperbarui.'
    : 'Tidak ada USER ID yang perlu dibuat. Akun yang sudah memiliki ID format baru tetap sama.';
  return { success: true, message: message, data: listAccounts_().data };
}

function generatedAccountId_(name, phone) {
  const cleaned = String(name || '').trim();
  const words = cleaned.split(/\s+/).filter(function (w) { return /^[A-Za-z]{2,}/.test(w); });
  const firstWord = words[0] ? words[0].match(/[A-Za-z]{2,}/)[0] : '';
  const phoneDigits = String(phone || '').replace(/\D/g, '');
  if (!firstWord || firstWord.length < 2) {
    return { success: false, message: 'Nama harus memiliki minimal 2 huruf untuk membuat ID akun.' };
  }
  if (phoneDigits.length < 4) {
    return { success: false, message: 'Nomor WhatsApp harus memiliki minimal 4 angka untuk membuat ID akun.' };
  }
  return { success: true, id: firstWord.slice(0, 2).toUpperCase() + phoneDigits.slice(-4) };
}

function normalizedPersonName_(value) {
  return String(value || '').trim().toUpperCase().replace(/\s+/g, ' ');
}

function normalizedAccountRole_(value) {
  const role = String(value || '').trim().toUpperCase();
  if (['STUDENT', 'MURID'].indexOf(role) >= 0) return 'SISWA';
  if (['TEACHER', 'INSTRUCTOR', 'GURU'].indexOf(role) >= 0) return 'SENSEI';
  return role;
}

function masterPerson_(role, masterId) {
  const sheetName = role === 'SISWA' ? 'STUDENTS' : role === 'SENSEI' ? 'SENSEI' : '';
  if (!sheetName) return { success: true, person: null };

  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: 'Sheet ' + sheetName + ' tidak ditemukan.' };
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { success: false, message: 'Header sheet ' + sheetName + ' belum tersedia.' };
  const headers = values[0].map(String);
  const idIndex = findColumnIndex_(headers, [role === 'SISWA' ? 'ID_SISWA' : 'ID_SENSEI']);
  const nameIndex = findColumnIndex_(headers, ['NAMA', 'NAME']);
  if (idIndex < 0) return { success: false, message: 'Kolom ID untuk ' + role + ' tidak ditemukan.' };

  const row = values.slice(1).find(function (item) {
    return String(item[idIndex] || '').trim().toUpperCase() === String(masterId || '').trim().toUpperCase();
  });
  if (!row) return { success: false, message: 'ID master tersebut belum terdaftar pada data ' + (role === 'SISWA' ? 'siswa.' : 'sensei.') };
  const phoneIndex = findColumnIndex_(headers, ['NO_WA', 'NO_HP', 'PHONE', 'WHATSAPP', 'WA', 'HP', 'TELP']);
  return {
    success: true,
    person: {
      id: row[idIndex],
      name: nameIndex < 0 ? String(masterId) : String(row[nameIndex] || masterId),
      phone: phoneIndex < 0 ? '' : String(row[phoneIndex] || '')
    }
  };
}

function accountMasterPerson_(role, masterId, accountName) {
  const linked = masterPerson_(role, masterId);
  if (linked.success || !String(accountName || '').trim()) return linked;
  const sheetName = role === 'SISWA' ? 'STUDENTS' : 'SENSEI';
  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) return linked;
  const values = sheet.getDataRange().getValues();
  if (!values.length) return linked;
  const headers = values[0].map(String);
  const idIndex = findColumnIndex_(headers, [role === 'SISWA' ? 'ID_SISWA' : 'ID_SENSEI']);
  const nameIndex = findColumnIndex_(headers, ['NAMA', 'NAME']);
  const phoneIndex = findColumnIndex_(headers, ['NO_WA', 'NO_HP', 'PHONE', 'WHATSAPP', 'WA', 'HP', 'TELP']);
  if (idIndex < 0 || nameIndex < 0) return linked;
  const matches = values.slice(1).filter(function (row) {
    return normalizedPersonName_(row[nameIndex]) === normalizedPersonName_(accountName);
  });
  if (matches.length !== 1) {
    return {
      success: false,
      message: matches.length
        ? 'Nama akun "' + accountName + '" cocok dengan lebih dari satu data master ' + (role === 'SISWA' ? 'siswa.' : 'sensei.') + ' Hubungkan akun ke ID master yang benar.'
        : linked.message
    };
  }
  return {
    success: true,
    person: {
      id: matches[0][idIndex],
      name: matches[0][nameIndex],
      phone: phoneIndex < 0 ? '' : String(matches[0][phoneIndex] || '')
    }
  };
}

function uploadAttendancePhoto_(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  const type = String(data.type || 'PHOTO').toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  const base64 = String(data.base64 || '').trim();
  const mimeType = String(data.mimeType || 'image/jpeg');

  const actorId = String(data.actorId || '').trim().replace(/[^A-Za-z0-9_-]/g, '_') || 'UNKNOWN';
  const tanggal = String(data.tanggal || '').trim().slice(0, 10).replace(/[^0-9-]/g, '') ||
    Utilities.formatDate(new Date(), ARIMA.TIMEZONE, 'yyyy-MM-dd');

  if (!base64) return { success: false, message: 'Data foto kosong.' };

  try {
    const folderName = 'ARIMA_ATTENDANCE_PHOTOS';
    let folder;
    const found = DriveApp.getFoldersByName(folderName);
    folder = found.hasNext() ? found.next() : DriveApp.createFolder(folderName);

    const monthKey = tanggal.slice(0, 7);
    let monthFolder;
    const monthSearch = folder.getFoldersByName(monthKey);
    monthFolder = monthSearch.hasNext() ? monthSearch.next() : folder.createFolder(monthKey);

    const timestamp = Utilities.formatDate(new Date(), ARIMA.TIMEZONE, 'HHmmss');
    const fullName = actorId + '_' + tanggal + '_' + type + '_' + timestamp + '.jpg';

    const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fullName);
    const file = monthFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const url = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    return { success: true, message: 'Foto berhasil diunggah.', data: { url: url, fileId: file.getId(), fileName: fullName } };
  } catch (err) {
    return { success: false, message: 'Gagal mengunggah foto: ' + (err && err.message ? err.message : err) };
  }
}

function uploadFile_(payload) {
  const data = payload && typeof payload === 'object' ? payload : {};
  const base64 = String(data.base64 || '').trim();
  const mimeType = String(data.mimeType || 'application/octet-stream');
  const fileName = String(data.fileName || 'file').replace(/[^A-Za-z0-9_.-]/g, '_');
  
  if (!base64) return { success: false, message: 'Data file kosong.' };

  try {
    const folderName = 'ARIMA_STUDENT_FILES';
    let folder;
    const found = DriveApp.getFoldersByName(folderName);
    folder = found.hasNext() ? found.next() : DriveApp.createFolder(folderName);

    const timestamp = Utilities.formatDate(new Date(), ARIMA.TIMEZONE, 'yyyyMMdd-HHmmss');
    const fullName = timestamp + '_' + fileName;

    const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fullName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const url = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    return { 
      success: true, 
      message: 'File berhasil diunggah.', 
      data: { url: url, fileId: file.getId(), fileName: fullName } 
    };
  } catch (err) {
    return { success: false, message: 'Gagal mengunggah file: ' + (err && err.message ? err.message : err) };
  }
}

function linkedAccountPerson_(role, userId) {
  if (role !== 'SISWA' && role !== 'SENSEI') return { success: true, person: null };
  let masterId = String(userId || '').trim();
  const meta = accountSheetMeta_();
  if (!meta.success) return meta;
  const account = accountRowById_(meta, userId);
  if (account &&
      normalizedAccountRole_(account.row[meta.columns.role]) === role &&
      String(account.row[meta.columns.masterId] || '').trim()) {
    masterId = String(account.row[meta.columns.masterId]).trim();
  }
  return masterPerson_(role, masterId);
}

function migrateLinkedAccountIds_(meta) {
  const updates = [];
  const finalIds = {};
  const collisionIds = {};
  const linkedRoles = ['SISWA', 'SENSEI'];

  meta.values.slice(1).forEach(function (row, index) {
    const currentId = String(row[meta.columns.id] || '').trim();
    if (!currentId) return;
    const role = normalizedAccountRole_(row[meta.columns.role]);
    let nextId = currentId;
    let masterId = String(row[meta.columns.masterId] || '').trim();

    if (linkedRoles.indexOf(role) >= 0) {
      const linked = accountMasterPerson_(role, masterId || currentId, row[meta.columns.name]);
      if (!linked.success) {
        collisionIds['INVALID ' + currentId] = linked.message;
        return;
      }
      masterId = String(linked.person.id || '').trim();
      const generated = generatedAccountId_(linked.person.name, linked.person.phone);
      if (!generated.success) {
        collisionIds['INVALID ' + currentId] = generated.message + ' (' + currentId + ')';
        return;
      }
      nextId = generated.id;
      updates.push({
        rowNumber: index + 2,
        id: nextId,
        masterId: masterId,
        role: role,
        previousId: currentId
      });
    }

    const normalizedId = nextId.toUpperCase();
    if (!finalIds[normalizedId]) finalIds[normalizedId] = [];
    finalIds[normalizedId].push(currentId);
  });

  Object.keys(finalIds).forEach(function (id) {
    if (finalIds[id].length > 1) {
      collisionIds[id] = 'ID hasil format bertabrakan untuk akun: ' + finalIds[id].join(', ');
    }
  });
  if (Object.keys(collisionIds).length) {
    return {
      success: false,
      message: 'ID akun belum dapat diperbarui. ' + Object.keys(collisionIds).map(function (id) {
        return collisionIds[id];
      }).join(' ')
    };
  }

  updates.forEach(function (update) {
    if (update.id !== update.previousId) {
      meta.sheet.getRange(update.rowNumber, meta.columns.id + 1).setValue(update.id);
    }
    meta.sheet.getRange(update.rowNumber, meta.columns.masterId + 1).setValue(update.masterId);
    if (normalizedAccountRole_(meta.values[update.rowNumber - 1][meta.columns.role]) !== update.role) {
      meta.sheet.getRange(update.rowNumber, meta.columns.role + 1).setValue(update.role);
    }
  });
  return {
    success: true,
    changed: updates.filter(function (update) { return update.id !== update.previousId; }).length,
    updated: updates.length
  };
}

function attendanceProfile_(token) {
  const user = tokenUser_(token);
  const role = String(user.role || '').trim().toUpperCase();
  const linked = linkedAccountPerson_(role, user.id);
  if (!linked.success) return linked;
  const actorType = role === 'SISWA' ? 'STUDENT' : 'SENSEI';
  const todayAttendance = attendanceForToday_(String(linked.person.id), actorType);
  return {
    success: true,
    data: {
      id: String(linked.person.id),
      name: linked.person.name,
      phone: linked.person.phone,
      role: actorType,
      todayAttendance: todayAttendance
    }
  };
}

function attendanceForToday_(actorId, actorType) {
  const sheet = ss_().getSheetByName('ATTENDANCE');
  if (!sheet) return null;
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;

  const headers = values[0].map(String);
  const idIndex = findColumnIndex_(headers, ['ACTOR_ID']);
  const typeIndex = findColumnIndex_(headers, ['ACTOR_TYPE']);
  const dateIndex = findColumnIndex_(headers, ['TANGGAL']);
  if ([idIndex, typeIndex, dateIndex].some(function (index) { return index < 0; })) return null;
  const today = Utilities.formatDate(new Date(), ARIMA.TIMEZONE, 'yyyy-MM-dd');
  const rowIndex = values.slice(1).findIndex(function (row) {
    return String(row[idIndex] || '').trim() === actorId &&
      String(row[typeIndex] || '').trim().toUpperCase() === actorType &&
      attendanceDateKey_(row[dateIndex]) === today;
  });
  if (rowIndex < 0) return null;

  const row = values[rowIndex + 1];
  const get = function (field) {
    const index = findColumnIndex_(headers, [field]);
    return index < 0 ? '' : row[index];
  };
  const startMinutes = clockMinutes_(get('JAM_MASUK'));
  const endMinutes = clockMinutes_(get('JAM_KELUAR'));
  const result = {
    ATTENDANCE_ID: get('ATTENDANCE_ID'),
    TANGGAL: today,
    JAM_MASUK: clockLabel_(startMinutes),
    JAM_KELUAR: clockLabel_(endMinutes),
    STATUS: get('STATUS'),
    CATATAN: get('CATATAN')
  };
  if (actorType === 'SENSEI') {
    let breaksArr = [];
    const jsonRaw = get('ISTIRAHAT_JSON');
    if (jsonRaw) {
      try { breaksArr = JSON.parse(jsonRaw); } catch (e) { breaksArr = []; }
    }
    if (!breaksArr.length) {
      const bs = get('ISTIRAHAT_MULAI');
      const be = get('ISTIRAHAT_SELESAI');
      if (bs && be) breaksArr.push([clockLabel_(clockMinutes_(bs)), clockLabel_(clockMinutes_(be))]);
    }
    result.ISTIRAHAT = breaksArr;
    result.ISTIRAHAT_MULAI = breaksArr[0] ? breaksArr[0][0] : '';
    result.ISTIRAHAT_SELESAI = breaksArr[0] ? breaksArr[0][1] : '';
    result.FOTO_KELAS_URL = get('FOTO_KELAS_URL');
    result.FOTO_ABSENSI_URL = get('FOTO_ABSENSI_URL');

    const paid = paidTeachingMinutes_(startMinutes, endMinutes, breaksArr);
    result.DURASI_MENIT = paid;
    result.JP = paid === null ? null : Math.round((paid / 45) * 100) / 100;
  }
  return result;
}

function clockLabel_(minutes) {
  if (minutes === null || minutes === undefined) return '';
  return ('0' + Math.floor(minutes / 60)).slice(-2) + ':' + ('0' + (minutes % 60)).slice(-2);
}

function attendanceDateKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, ARIMA.TIMEZONE, 'yyyy-MM-dd');
  return String(value || '').trim().slice(0, 10);
}

function saveOwnAttendance_(payload, token) {
  const user = tokenUser_(token);
  const actorId = String(user.id || '').trim();
  const accountRole = String(user.role || '').trim().toUpperCase();
  const linked = linkedAccountPerson_(accountRole, actorId);
  if (!linked.success) return linked;
  const actorType = accountRole === 'SISWA' ? 'STUDENT' : 'SENSEI';
  const record = payload && typeof payload === 'object' ? payload : {};
  const status = String(record.STATUS || '').trim().toUpperCase();
  const allowedStatuses = ['HADIR', 'IZIN', 'SAKIT', 'ALPA', 'TERLAMBAT'];
  if (allowedStatuses.indexOf(status) < 0) return { success: false, message: 'Status absensi tidak valid.' };

  const today = Utilities.formatDate(new Date(), ARIMA.TIMEZONE, 'yyyy-MM-dd');
  const start = String(record.JAM_MASUK || '').trim();
  const end = String(record.JAM_KELUAR || '').trim();
  if ((start && clockMinutes_(start) === null) || (end && clockMinutes_(end) === null)) {
    return { success: false, message: 'Format jam absensi tidak valid.' };
  }
  if (actorType === 'SENSEI' && (status === 'HADIR' || status === 'TERLAMBAT') && (!start || !end)) {
    return { success: false, message: 'Sensei wajib mengisi jam mengajar mulai dan selesai.' };
  }
  if (actorType === 'SENSEI' && !String(record.CATATAN || '').trim()) {
    return { success: false, message: 'Sensei wajib mengisi catatan absensi (mis. materi yang diajarkan).' };
  }

  const sheet = ss_().getSheetByName('ATTENDANCE');
  if (!sheet) return { success: false, message: 'Sheet ATTENDANCE tidak ditemukan.' };
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  if (ensureAttendanceColumns_(sheet, headers).length) {
    values.length = 0;
    const newValues = sheet.getDataRange().getValues();
    values.push.apply(values, newValues);
  }
  const idIndex = findColumnIndex_(headers, ['ACTOR_ID']);
  const typeIndex = findColumnIndex_(headers, ['ACTOR_TYPE']);
  const dateIndex = findColumnIndex_(headers, ['TANGGAL']);
  const keyIndex = findColumnIndex_(headers, ['ATTENDANCE_ID']);
  const startIndex = findColumnIndex_(headers, ['JAM_MASUK']);
  const endIndex = findColumnIndex_(headers, ['JAM_KELUAR']);
  if ([idIndex, typeIndex, dateIndex, keyIndex, startIndex, endIndex].some(function (index) { return index < 0; })) {
    return { success: false, message: 'Kolom sheet ATTENDANCE belum lengkap.' };
  }

  let existing = null;
  for (let index = 1; index < values.length; index += 1) {
    const row = values[index];
    if (String(row[idIndex] || '').trim() === actorId &&
        String(row[typeIndex] || '').trim().toUpperCase() === actorType &&
        attendanceDateKey_(row[dateIndex]) === today) {
      existing = { row: row, rowNumber: index + 1 };
      break;
    }
  }

  const existingStartMinutes = existing ? clockMinutes_(existing.row[startIndex]) : null;
  const existingEndMinutes = existing ? clockMinutes_(existing.row[endIndex]) : null;

  const attendance = {
    ACTOR_ID: actorId,
    ACTOR_TYPE: actorType,
    SESSION_ID: '',
    CLASS_ID: '',
    TANGGAL: today,
    JAM_MASUK: existingStartMinutes !== null ? clockLabel_(existingStartMinutes) : start,
    JAM_KELUAR: end ? end : (existingEndMinutes !== null ? clockLabel_(existingEndMinutes) : ''),
    STATUS: status,
    CATATAN: String(record.CATATAN || '')
  };
  if (actorType === 'SENSEI') {
    let breaksArr = [];
    if (Array.isArray(record.ISTIRAHAT)) {
      breaksArr = record.ISTIRAHAT;
    } else if (record.ISTIRAHAT_JSON) {
      try { breaksArr = JSON.parse(record.ISTIRAHAT_JSON); } catch (e) { breaksArr = []; }
    }
    if (!breaksArr.length && (record.ISTIRAHAT_MULAI || record.ISTIRAHAT_SELESAI)) {
      if (record.ISTIRAHAT_MULAI && record.ISTIRAHAT_SELESAI) {
        breaksArr.push([record.ISTIRAHAT_MULAI, record.ISTIRAHAT_SELESAI]);
      }
    }
    breaksArr = breaksArr.filter(function (b) {
      return Array.isArray(b) && b[0] && b[1] && clockMinutes_(b[0]) !== null && clockMinutes_(b[1]) !== null;
    });

    attendance.ISTIRAHAT_JSON = JSON.stringify(breaksArr);
    attendance.ISTIRAHAT_MULAI = breaksArr[0] ? breaksArr[0][0] : '';
    attendance.ISTIRAHAT_SELESAI = breaksArr[0] ? breaksArr[0][1] : '';
    attendance.FOTO_KELAS_URL = String(record.FOTO_KELAS_URL || '');
    attendance.FOTO_ABSENSI_URL = String(record.FOTO_ABSENSI_URL || '');
  }
  if (existing) {
    attendance.ATTENDANCE_ID = existing.row[keyIndex];
    attendance.__ROW_NUMBER = existing.rowNumber;
    attendance.__MODE = 'update';
  } else {
    attendance.__MODE = 'create';
  }

  const result = saveSheetRecord_('ATTENDANCE', 'ATTENDANCE_ID', attendance);
  if (!result.success) return result;
  return { success: true, message: existing ? 'Absensi hari ini berhasil diperbarui.' : 'Absensi berhasil tercatat.', data: result.data };
}

function ensureAttendanceColumns_(sheet, headers) {
  const needed = ['ISTIRAHAT_JSON', 'FOTO_KELAS_URL', 'FOTO_ABSENSI_URL'];
  const added = [];
  needed.forEach(function (col) {
    if (findColumnIndex_(headers, [col]) < 0) {
      const newCol = sheet.getLastColumn() + 1;
      sheet.getRange(1, newCol).setValue(col);
      headers.push(col);
      added.push(col);
    }
  });
  return added;
}

function accountRowById_(meta, userId) {
  const normalized = String(userId || '').trim().toUpperCase();
  for (let index = 1; index < meta.values.length; index += 1) {
    if (String(meta.values[index][meta.columns.id] || '').trim().toUpperCase() === normalized) {
      return { row: meta.values[index], rowNumber: index + 1 };
    }
  }
  return null;
}

function accountPasswordValues_(password) {
  const value = String(password || '');
  if (value.length < 8) return { success: false, message: 'Password minimal 8 karakter.' };
  const salt = Utilities.getUuid();
  return { success: true, salt: salt, hash: hashPassword_(value, salt, buildAuthSecret_()) };
}

function createAccount_(payload) {
  const record = payload && typeof payload === 'object' ? payload : {};
  const role = String(record.role || record.ROLE || '').trim().toUpperCase();
  if (['ADMIN', 'SENSEI', 'SISWA'].indexOf(role) < 0) return { success: false, message: 'Role akun tidak valid.' };

  let userId = '';
  let masterId = '';
  let name = String(record.name || record.NAMA || '').trim();
  if (role !== 'ADMIN') {
    masterId = String(record.masterId || record.linkedId || record.MASTER_ID || record.userId || record.USER_ID || '').trim();
    if (!masterId) return { success: false, message: 'Pilih data master siswa atau sensei.' };
    const linked = masterPerson_(role, masterId);
    if (!linked.success) return linked;
    name = linked.person.name;
    const generated = generatedAccountId_(linked.person.name, linked.person.phone);
    if (!generated.success) return generated;
    userId = generated.id;
    masterId = String(linked.person.id);
  } else {
    userId = String(record.userId || record.USER_ID || '').trim().toUpperCase();
    if (!userId) return { success: false, message: 'ID akun admin wajib diisi.' };
  }
  if (!name) return { success: false, message: 'Nama admin wajib diisi.' };

  const meta = accountSheetMeta_();
  if (!meta.success) return meta;
  if (accountRowById_(meta, userId)) return { success: false, message: 'ID akun ' + userId + ' sudah terdaftar. Pastikan nama dan nomor WhatsApp menghasilkan ID yang berbeda.' };
  if (role !== 'ADMIN') {
    const linkedAccountExists = meta.values.slice(1).some(function (row) {
      return String(row[meta.columns.role] || '').trim().toUpperCase() === role &&
        String(row[meta.columns.masterId] || '').trim().toUpperCase() === masterId.toUpperCase();
    });
    if (linkedAccountExists) return { success: false, message: 'Data master tersebut sudah memiliki akun.' };
  }

  const password = accountPasswordValues_(record.password);
  if (!password.success) return password;

  const row = new Array(meta.headers.length).fill('');
  row[meta.columns.id] = userId;
  row[meta.columns.name] = name;
  row[meta.columns.role] = role;
  row[meta.columns.salt] = password.salt;
  row[meta.columns.hash] = password.hash;
  row[meta.columns.masterId] = masterId;
  const createdIndex = findColumnIndex_(meta.headers, ['CREATED_AT']);
  if (createdIndex >= 0) row[createdIndex] = new Date();
  meta.sheet.appendRow(row);

  return { success: true, message: 'Akun berhasil dibuat dengan ID ' + userId + '.', data: { USER_ID: userId, MASTER_ID: masterId, NAMA: name, ROLE: role } };
}

function resetAccountPassword_(payload) {
  const record = payload && typeof payload === 'object' ? payload : {};
  const userId = String(record.userId || record.USER_ID || '').trim();
  const meta = accountSheetMeta_();
  if (!meta.success) return meta;
  const found = accountRowById_(meta, userId);
  if (!found) return { success: false, message: 'Akun tidak ditemukan.' };

  const password = accountPasswordValues_(record.password);
  if (!password.success) return password;
  meta.sheet.getRange(found.rowNumber, meta.columns.salt + 1).setValue(password.salt);
  meta.sheet.getRange(found.rowNumber, meta.columns.hash + 1).setValue(password.hash);
  const updatedIndex = findColumnIndex_(meta.headers, ['UPDATED_AT']);
  if (updatedIndex >= 0) meta.sheet.getRange(found.rowNumber, updatedIndex + 1).setValue(new Date());

  return { success: true, message: 'Password akun berhasil direset.', data: { USER_ID: userId } };
}

function deleteAccount_(payload, token) {
  const record = payload && typeof payload === 'object' ? payload : {};
  const userId = String(record.userId || record.USER_ID || '').trim();
  const actor = tokenUser_(token);
  if (String(actor && actor.id || '').trim().toUpperCase() === userId.toUpperCase()) {
    return { success: false, message: 'Akun yang sedang digunakan tidak dapat dihapus.' };
  }

  const meta = accountSheetMeta_();
  if (!meta.success) return meta;
  const found = accountRowById_(meta, userId);
  if (!found) return { success: false, message: 'Akun tidak ditemukan.' };

  const role = String(found.row[meta.columns.role] || '').trim().toUpperCase();
  if (role === 'ADMIN') {
    const admins = meta.values.slice(1).filter(function (row) {
      return String(row[meta.columns.role] || '').trim().toUpperCase() === 'ADMIN';
    });
    if (admins.length <= 1) return { success: false, message: 'Akun admin terakhir tidak dapat dihapus.' };
  }

  meta.sheet.deleteRow(found.rowNumber);
  return { success: true, message: 'Akun berhasil dihapus.' };
}

function salaryAccessError_(token) {
  const user = tokenUser_(token);
  if (!user) {
    return { success: false, code: 'AUTH_REQUIRED', message: 'Sesi login perlu diperbarui. Silakan keluar lalu login kembali.' };
  }
  return String(user.role || '').trim().toUpperCase() === 'ADMIN' ? null : adminOnlyResponse_();
}

function senseiList_(token) {
  const response = listSheet_('SENSEI');
  if (!response.success || isAdminToken_(token)) return response;

  response.data.forEach(function (row) {
    delete row.TARIF_PER_PERTEMUAN;
    delete row.TARIF_PER_JAM;
  });
  return response;
}

function saveSenseiRecord_(payload, token) {
  if (isAdminToken_(token)) return saveSheetRecord_('SENSEI', 'ID_SENSEI', payload);

  const record = Object.assign({}, payload && typeof payload === 'object' ? payload : {});
  delete record.TARIF_PER_PERTEMUAN;
  delete record.TARIF_PER_JAM;
  return saveSheetRecord_('SENSEI', 'ID_SENSEI', record);
}

function randomSecret_() {
  return Utilities.getUuid() + Utilities.getUuid() + Utilities.getUuid();
}

function buildTokenSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('ARIMA_TOKEN_SECRET');
  if (!secret) {
    secret = randomSecret_();
    props.setProperty('ARIMA_TOKEN_SECRET', secret);
  }
  return secret;
}

function buildAuthSecret_() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty('ARIMA_AUTH_SECRET');
  if (!secret) {
    secret = randomSecret_();
    props.setProperty('ARIMA_AUTH_SECRET', secret);
  }
  return secret;
}

function safeEqual_(a, b) {
  const x = String(a || '');
  const y = String(b || '');
  let diff = x.length ^ y.length;
  const length = Math.max(x.length, y.length);
  for (let index = 0; index < length; index += 1) {
    diff |= (x.charCodeAt(index) || 0) ^ (y.charCodeAt(index) || 0);
  }
  return diff === 0;
}

function toHex_(bytes) {
  const data = Array.isArray(bytes) ? bytes : Array.from(bytes || []);
  return data.map(function (byte) {
    return ('0' + (byte & 0xff).toString(16)).slice(-2);
  }).join('');
}

function hashPassword_(password, salt, secret) {
  const text = String(salt || '') + ':' + String(password || '');
  const signature = Utilities.computeHmacSha256Signature(text, String(secret || ''));
  return toHex_(signature).toLowerCase();
}

function toBase64Url_(bytes) {
  if (!bytes) return '';
  const encoded = Utilities.base64Encode(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return String(encoded || '').trim();
}

function passwordHashCandidates_(password, salt, secret) {
  const values = new Set();
  const textA = String(salt || '') + ':' + String(password || '');
  const textB = String(password || '') + ':' + String(salt || '');
  const secretText = String(secret || '');

  const add = function (value) {
    if (!value) return;
    const normalized = String(value).trim();
    if (!normalized) return;
    values.add(normalized.toLowerCase());
    values.add(normalized);
  };

  const hmacA = Utilities.computeHmacSha256Signature(textA, secretText);
  const hmacB = Utilities.computeHmacSha256Signature(textB, secretText);
  add(toHex_(hmacA));
  add(toHex_(hmacB));
  add(toBase64Url_(hmacA));
  add(toBase64Url_(hmacB));
  add(Utilities.base64Encode(hmacA));
  add(Utilities.base64Encode(hmacB));

  if (typeof Utilities.computeDigest === 'function') {
    const shaA = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, textA);
    const shaB = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, textB);
    add(toHex_(shaA));
    add(toHex_(shaB));
    add(toBase64Url_(shaA));
    add(toBase64Url_(shaB));
    add(Utilities.base64Encode(shaA));
    add(Utilities.base64Encode(shaB));
  }

  return Array.from(values);
}

function verifyPassword_(password, user, secret) {
  const storedHash = String(user && user.passwordHash ? user.passwordHash : '').trim();
  if (!storedHash) return false;

  const salt = String(user && user.salt ? user.salt : '').trim();
  if (!salt) return false;

  const candidates = passwordHashCandidates_(password, salt, secret);
  const normalizedStored = storedHash.replace(/\s+/g, '').trim();

  const target = normalizedStored.toLowerCase();
  let matched = false;
  candidates.forEach(function (candidate) {
    if (safeEqual_(String(candidate).replace(/\s+/g, '').toLowerCase(), target)) matched = true;
  });
  return matched;
}

function initialAdminUser_() {
  const secret = buildAuthSecret_();
  const password = Utilities.getUuid().replace(/-/g, '').slice(0, 12);
  const salt = Utilities.getUuid();
  return {
    id: 'ADMIN001',
    name: 'Administrator',
    role: 'ADMIN',
    salt: salt,
    password: password,
    passwordHash: hashPassword_(password, salt, secret)
  };
}

function createInitialAdmin_() {
  const sheet = ensureUsersSheet_();
  if (!sheet) throw new Error('Sheet USERS tidak dapat dibuat.');
  const existing = getUsersFromSheet_(sheet);
  if (existing.length) return { success: true, created: false, message: 'USERS sudah memiliki data.' };
  const user = initialAdminUser_();
  sheet.appendRow([user.id, user.name, user.role, user.salt, user.passwordHash]);
  return { success: true, created: true, userId: user.id, password: user.password, message: 'Admin awal berhasil dibuat. Catat password ini lalu segera ganti.' };
}

function ensureUsersSheet_() {
  const workbook = ss_();
  if (!workbook || typeof workbook.getSheetByName !== 'function') {
    return null;
  }

  let sheet = workbook.getSheetByName('USERS');
  if (!sheet) {
    if (typeof workbook.insertSheet !== 'function') {
      return null;
    }
    sheet = workbook.insertSheet('USERS');
  }

  const headers = ['ID', 'NAMA', 'ROLE', 'SALT', 'PASSWORD_HASH'];
  const current = typeof sheet.getDataRange === 'function' ? sheet.getDataRange().getValues() : [];
  if (!current.length) {
    if (typeof sheet.appendRow !== 'function') return sheet;
    sheet.appendRow(headers);
    return sheet;
  }

  const firstRow = current[0].map(function (cell) {
    return String(cell || '').trim();
  });
  if (JSON.stringify(firstRow) !== JSON.stringify(headers)) {
    if (typeof sheet.getRange === 'function') {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function normalizeUserRecord_(record) {
  if (!record || typeof record !== 'object') return null;

  const id = String(record.USER_ID || record.ID || record.userId || record.id || '').trim();
  if (!id) return null;

  const name = String(record.NAME || record.NAMA || record.name || record.fullName || id).trim();
  const role = String(record.ROLE || record.role || 'USER').trim() || 'USER';
  const passwordHash = record.PASSWORD_HASH || record.PASSWORDHASH || record.passwordHash || record['PASSWORD HASH'] || '';
  const salt = record.PASSWORD_SALT || record.SALT || record.PASSWORD_SALT || record.passwordSalt || record['PASSWORD SALT'] || '';

  return {
    id: id,
    name: name,
    role: role,
    passwordHash: String(passwordHash || ''),
    salt: String(salt || '')
  };
}

function getUsersFromSheet_(sh) {
  if (!sh || typeof sh.getDataRange !== 'function') return [];
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(function (header) { return String(header || '').trim(); });
  return values.slice(1).filter(function (row) {
    return row.some(function (cell) { return cell !== '' && cell !== null && cell !== undefined; });
  }).map(function (row) {
    const record = {};
    headers.forEach(function (header, index) { record[header] = row[index]; });
    return normalizeUserRecord_(record);
  }).filter(function (user) { return !!user; });
}

function getUsers_() {
  const workbook = ss_();
  if (!workbook || typeof workbook.getSheetByName !== 'function') {
    throw new Error('Database Spreadsheet tidak dapat diakses.');
  }

  let sh = workbook.getSheetByName('USERS');
  if (!sh) sh = ensureUsersSheet_();
  if (!sh) throw new Error('Sheet USERS tidak tersedia.');

  return getUsersFromSheet_(sh);
}

function findUserById_(userId) {
  const normalized = String(userId || '').trim().toUpperCase();
  const users = getUsers_();
  return users.find(function (user) {
    return String(user.id || '').trim().toUpperCase() === normalized;
  }) || null;
}

function loginThrottleKey_(id) {
  return 'login_fail_' + String(id || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40);
}

function loginFailCount_(id) {
  return Number(CacheService.getScriptCache().get(loginThrottleKey_(id)) || 0);
}

function recordLoginFailure_(id) {
  const cache = CacheService.getScriptCache();
  const key = loginThrottleKey_(id);
  cache.put(key, String(Number(cache.get(key) || 0) + 1), ARIMA.LOGIN_LOCK_SECONDS);
}

function login_(p) {
  const id = String(p && p.userId ? p.userId : '').trim();
  const password = String(p && p.password ? p.password : '');
  const invalid = { success: false, message: 'ID atau password salah.' };

  if (!id) return { success: false, message: 'ID wajib diisi.' };
  if (!password) return { success: false, message: 'Password wajib diisi.' };

  if (loginFailCount_(id) >= ARIMA.LOGIN_MAX_FAILS) {
    return { success: false, code: 'TOO_MANY_ATTEMPTS', message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' };
  }

  const user = findUserById_(id);
  const secret = buildAuthSecret_();
  if (!user || !verifyPassword_(password, user, secret)) {
    recordLoginFailure_(id);
    return invalid;
  }

  CacheService.getScriptCache().remove(loginThrottleKey_(id));

  const safeUser = {
    id: String(user.id || id),
    name: String(user.name || id),
    role: String(user.role || 'USER')
  };

  const tokenPayload = JSON.stringify({
    id: safeUser.id,
    name: safeUser.name,
    role: safeUser.role,
    exp: Date.now() + ARIMA.TOKEN_TTL_MS
  });

  const token = Utilities.base64Encode(tokenPayload) + '.' + toBase64Url_(
    Utilities.computeHmacSha256Signature(tokenPayload, buildTokenSecret_())
  );

  return {
    success: true,
    message: 'Login berhasil.',
    token: token,
    user: safeUser
  };
}

function listSheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) return { success: false, message: 'Sheet not found: ' + name };

  const values = sh.getDataRange().getValues();
  if (values.length < 2) return { success: true, data: [] };

  const headers = values[0].map(String);
  const data = values.slice(1).map(function (row, index) {
    return { row: row, rowNumber: index + 2 };
  }).filter(function (entry) {
    return entry.row.some(function (cell) {
      return cell !== '' && cell !== null && cell !== undefined;
    });
  }).map(function (entry) {
    const obj = {};
    headers.forEach(function (header, index) {
      obj[header] = entry.row[index];
    });
    obj.__ROW_NUMBER = entry.rowNumber;
    return obj;
  });

  return { success: true, data: data };
}

function financeSheet_() {
  const workbook = ss_();
  let sheet = workbook.getSheetByName('FINANCE');
  if (!sheet) sheet = workbook.insertSheet('FINANCE');

  const headers = [
    'TRANSACTION_ID', 'DATE', 'TYPE', 'CATEGORY', 'DESCRIPTION', 'AMOUNT',
    'PAYMENT_METHOD', 'REFERENCE_NO', 'NOTES', 'CREATED_AT', 'UPDATED_AT'
  ];
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  const actualHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (header) { return String(header || '').trim(); });
  const missing = headers.filter(function (header) {
    return findColumnIndex_(actualHeaders, [header]) < 0;
  });
  if (missing.length) {
    return { success: false, message: 'Header sheet FINANCE belum lengkap: ' + missing.join(', ') };
  }
  return { success: true, sheet: sheet };
}

function financeRecords_() {
  const result = financeSheet_();
  return result.success ? listSheet_('FINANCE') : result;
}

function requiredFields_(sheetName) {
  const fields = {
    STUDENTS: ['NAMA', 'NO_WA', 'NAMA_ORANG_TUA', 'PROGRAM', 'ASRAMA', 'TANGGAL_MASUK', 'STATUS'],
    SENSEI: ['NAMA'],
    ATTENDANCE: ['ACTOR_ID', 'ACTOR_TYPE', 'TANGGAL', 'STATUS'],
    BILLING: ['ID_SISWA', 'DESCRIPTION', 'CATEGORY', 'AMOUNT', 'DUE_DATE', 'STATUS'],
    PAYMENTS: ['BILLING_ID', 'ID_SISWA', 'PAYMENT_DATE', 'AMOUNT', 'PAYMENT_METHOD'],
    FINANCE: ['DATE', 'TYPE', 'CATEGORY', 'DESCRIPTION', 'AMOUNT', 'PAYMENT_METHOD'],
    SALARY: ['ID_SENSEI', 'PERIOD', 'PAYMENT_STATUS']
  };
  return fields[sheetName] || [];
}

function assignMissingStudentIds_() {
  return assignMissingMasterIds_('STUDENTS', 'ID_SISWA', 'SISWA');
}

function assignMissingSenseiIds_() {
  return assignMissingMasterIds_('SENSEI', 'ID_SENSEI', 'SENSEI');
}

function assignMissingMasterIds_(sheetName, idField, role) {
  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) return { success: false, message: 'Sheet not found: ' + sheetName };
  const values = sheet.getDataRange().getValues();
  if (!values.length) return { success: false, message: 'Header sheet ' + sheetName + ' belum tersedia.' };

  const headers = values[0].map(function (header) { return String(header || '').trim(); });
  const idIndex = findColumnIndex_(headers, [idField]);
  const nameIndex = findColumnIndex_(headers, ['NAMA', 'NAME']);
  const phoneIndex = findColumnIndex_(headers, ['NO_WA', 'NO_HP', 'PHONE', 'WHATSAPP', 'WA', 'HP', 'TELP']);
  if (idIndex < 0 || nameIndex < 0 || phoneIndex < 0) {
    return { success: false, message: 'Kolom ' + idField + ', NAMA, dan NO_WA/NO_HP wajib tersedia pada sheet ' + sheetName + '.' };
  }

  const legacyPattern = role === 'SISWA' ? /^SISWA\d+$/i : /^SENSEI\d+$/i;
  const usedIds = Object.create(null);
  values.slice(1).forEach(function (row) {
    const currentId = String(row[idIndex] || '').trim();
    if (currentId && !legacyPattern.test(currentId)) usedIds[currentId.toUpperCase()] = true;
  });

  const pending = [];
  const idMap = Object.create(null);
  const collisions = [];
  values.slice(1).forEach(function (row, offset) {
    if (!row.some(function (cell) { return String(cell || '').trim() !== ''; })) return;
    const currentId = String(row[idIndex] || '').trim();
    if (currentId && !legacyPattern.test(currentId)) return;
    const generated = generatedAccountId_(row[nameIndex], row[phoneIndex]);
    if (!generated.success) {
      collisions.push(String(row[nameIndex] || 'Baris ' + (offset + 2)) + ': ' + generated.message);
      return;
    }
    const normalizedId = generated.id.toUpperCase();
    if (usedIds[normalizedId]) {
      collisions.push(generated.id + ' sudah digunakan atau dihasilkan lebih dari sekali.');
      return;
    }
    usedIds[normalizedId] = true;
    pending.push({ rowNumber: offset + 2, id: generated.id, oldId: currentId });
    if (currentId) idMap[currentId.toUpperCase()] = generated.id;
  });

  if (collisions.length) {
    return {
      success: false,
      message: 'ID tidak dibuat karena ada data yang perlu diperbaiki: ' + collisions.join(' ')
    };
  }

  const accountMeta = accountSheetMeta_();
  if (!accountMeta.success) return accountMeta;
  const accountUpdates = [];
  const finalAccountIds = Object.create(null);
  const linkedRoles = ['SISWA', 'SENSEI'];
  accountMeta.values.slice(1).forEach(function (row, offset) {
    const currentId = String(row[accountMeta.columns.id] || '').trim();
    if (!currentId) return;
    const currentRole = normalizedAccountRole_(row[accountMeta.columns.role]);
    let nextId = currentId;
    let nextMasterId = String(row[accountMeta.columns.masterId] || '').trim();
    if (linkedRoles.indexOf(currentRole) >= 0) {
      const sourceMasterId = nextMasterId || currentId;
      const person = accountMasterPerson_(currentRole, sourceMasterId, row[accountMeta.columns.name]);
      if (person.success) {
        nextMasterId = idMap[String(person.person.id || '').trim().toUpperCase()] || String(person.person.id || '').trim();
        const generated = generatedAccountId_(person.person.name, person.person.phone);
        if (!generated.success) {
          collisions.push(currentId + ': ' + generated.message);
          return;
        }
        nextId = generated.id;
      } else if (idMap[String(sourceMasterId).trim().toUpperCase()]) {
        collisions.push(currentId + ': ' + person.message);
        return;
      }
    }
    const normalizedId = nextId.toUpperCase();
    if (finalAccountIds[normalizedId]) {
      collisions.push('USER ID ' + nextId + ' bertabrakan antara akun ' + finalAccountIds[normalizedId] + ' dan ' + currentId + '.');
      return;
    }
    finalAccountIds[normalizedId] = currentId;
    accountUpdates.push({
      rowNumber: offset + 2,
      id: nextId,
      masterId: nextMasterId,
      role: currentRole,
      previousId: currentId,
      previousMasterId: String(row[accountMeta.columns.masterId] || '').trim(),
      previousRole: String(row[accountMeta.columns.role] || '').trim().toUpperCase()
    });
  });
  if (collisions.length) {
    return { success: false, message: 'ID tidak diperbarui karena ada data yang perlu diperbaiki: ' + collisions.join(' ') };
  }

  const referenceUpdates = [];
  const planReferenceUpdates = function (referenceSheetName, referenceField, mapping, actorField) {
    if (!Object.keys(mapping).length) return;
    const referenceSheet = ss_().getSheetByName(referenceSheetName);
    if (!referenceSheet || referenceSheet.getLastRow() < 2) return;
    const referenceValues = referenceSheet.getDataRange().getValues();
    if (!referenceValues.length) return;
    const referenceHeaders = referenceValues[0].map(function (header) { return String(header || '').trim(); });
    const referenceIndex = findColumnIndex_(referenceHeaders, [referenceField]);
    const actorIndex = actorField ? findColumnIndex_(referenceHeaders, ['ACTOR_TYPE']) : -1;
    if (referenceIndex < 0) return;
    referenceValues.slice(1).forEach(function (referenceRow, rowOffset) {
      if (actorField && actorIndex >= 0 && attendanceActorType_(referenceRow[actorIndex]) !== actorField) return;
      const oldReference = String(referenceRow[referenceIndex] || '').trim();
      const newReference = mapping[oldReference.toUpperCase()];
      if (newReference) {
        referenceUpdates.push({ sheet: referenceSheet, rowNumber: rowOffset + 2, column: referenceIndex + 1, value: newReference });
      }
    });
  };
  planReferenceUpdates('ATTENDANCE', 'ACTOR_ID', idMap, role === 'SISWA' ? 'STUDENT' : 'SENSEI');
  if (role === 'SISWA') {
    planReferenceUpdates('BILLING', 'ID_SISWA', idMap);
    planReferenceUpdates('PAYMENTS', 'ID_SISWA', idMap);
  } else {
    planReferenceUpdates('SALARY', 'ID_SENSEI', idMap);
  }

  pending.forEach(function (entry) {
    sheet.getRange(entry.rowNumber, idIndex + 1).setValue(entry.id);
  });
  referenceUpdates.forEach(function (entry) {
    entry.sheet.getRange(entry.rowNumber, entry.column).setValue(entry.value);
  });
  accountUpdates.forEach(function (entry) {
    if (entry.id !== entry.previousId) accountMeta.sheet.getRange(entry.rowNumber, accountMeta.columns.id + 1).setValue(entry.id);
    if (entry.masterId !== entry.previousMasterId) accountMeta.sheet.getRange(entry.rowNumber, accountMeta.columns.masterId + 1).setValue(entry.masterId);
    if (entry.role !== entry.previousRole) accountMeta.sheet.getRange(entry.rowNumber, accountMeta.columns.role + 1).setValue(entry.role);
  });
  const changedIds = pending.filter(function (entry) { return entry.oldId !== entry.id; }).length;
  return {
    success: true,
    message: changedIds
      ? changedIds + ' ID master ' + (role === 'SISWA' ? 'siswa' : 'sensei') + ' berhasil dibuat/diperbarui. ID akun dan referensi terkait ikut disesuaikan.'
      : 'Semua ID master ' + (role === 'SISWA' ? 'siswa' : 'sensei') + ' sudah menggunakan format baru.',
    data: { assigned: pending.length, updated: changedIds, accountIdsUpdated: accountUpdates.filter(function (entry) { return entry.id !== entry.previousId; }).length }
  };
}

function nextRecordId_(sheetName, values, keyIndex) {
  const prefixes = {
    STUDENTS: 'SISWA',
    SENSEI: 'SENSEI',
    ATTENDANCE: 'ATT',
    BILLING: 'BILL',
    PAYMENTS: 'PAY',
    SALARY: 'SAL'
  };
  const prefix = prefixes[sheetName] || 'REC';
  let highest = 0;

  values.slice(1).forEach(function (row) {
    const match = String(row[keyIndex] || '').trim().match(new RegExp('^' + prefix + '(\\d+)$', 'i'));
    if (match) highest = Math.max(highest, Number(match[1]));
  });

  return prefix + String(highest + 1).padStart(3, '0');
}

function normalizeRecordValue_(field, value) {
  const numericFields = [
    'TARIF_PER_PERTEMUAN', 'TARIF_PER_JAM', 'AMOUNT', 'MEETING_COUNT',
    'HOUR_COUNT', 'BASE_AMOUNT', 'BONUS', 'TRANSPORT', 'DEDUCTION', 'NET_SALARY'
  ];
  const text = String(value === null || value === undefined ? '' : value).trim();
  if (!text || numericFields.indexOf(field) < 0) return text;

  const number = Number(text);
  if (!Number.isFinite(number)) {
    throw new Error(field + ' harus berupa angka yang valid.');
  }
  return number;
}

function periodKey_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, ARIMA.TIMEZONE, 'yyyy-MM');
  return String(value || '').trim().slice(0, 7);
}

function clockMinutes_(value) {
  if (value instanceof Date) {
    const localTime = Utilities.formatDate(value, ARIMA.TIMEZONE, 'HH:mm');
    return clockMinutes_(localTime);
  }
  if (typeof value === 'number' && value >= 0 && value < 1) return Math.round(value * 1440);

  const text = String(value || '').trim();

  if (/^0?\.\d+$/.test(text)) {
    const num = Number(text);
    if (num >= 0 && num < 1) return Math.round(num * 1440);
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
    const timestamp = new Date(text);
    if (!Number.isNaN(timestamp.getTime())) {
      return clockMinutes_(Utilities.formatDate(timestamp, ARIMA.TIMEZONE, 'HH:mm'));
    }
  }
  const match = text.match(/(?:T|^)(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  return hour <= 23 && minute <= 59 ? hour * 60 + minute : null;
}

function attendanceActorType_(value) {
  const type = String(value || '').trim().toUpperCase();
  if (['SENSEI', 'TEACHER', 'INSTRUCTOR', 'GURU'].indexOf(type) >= 0) return 'SENSEI';
  if (['STUDENT', 'SISWA', 'MURID'].indexOf(type) >= 0) return 'STUDENT';
  return type;
}

function paidTeachingMinutes_(start, end, breaksInput) {
  if (start === null || end === null || start === end) return null;

  const startAt = start;
  const endAt = end > start ? end : end + 1440;
  let paidMinutes = endAt - startAt;

  let breaks = [];
  if (Array.isArray(breaksInput)) {
    if (breaksInput.length && Array.isArray(breaksInput[0])) {
      breaks = breaksInput;
    } else if (breaksInput.length === 2) {
      breaks = [breaksInput];
    }
  }

  const breakRanges = [];
  breaks.forEach(function (b) {
    if (!Array.isArray(b) || b.length < 2) return;
    const bs = clockMinutes_(b[0]);
    const be = clockMinutes_(b[1]);
    if (bs === null || be === null || bs === be) return;
    breakRanges.push([bs, be]);
  });

  for (let dayStart = Math.floor(startAt / 1440) * 1440; dayStart < endAt; dayStart += 1440) {
    breakRanges.forEach(function (pause) {
      const be = pause[1] > pause[0] ? pause[1] : pause[1] + 1440;
      const overlapStart = Math.max(startAt, dayStart + pause[0]);
      const overlapEnd = Math.min(endAt, dayStart + be);
      paidMinutes -= Math.max(0, overlapEnd - overlapStart);
    });
  }

  return Math.max(0, paidMinutes);
}

function calculateSalaryRecord_(record) {
  const senseiSheet = ss_().getSheetByName('SENSEI');
  const attendanceSheet = ss_().getSheetByName('ATTENDANCE');
  if (!senseiSheet || !attendanceSheet) {
    return { success: false, message: 'Sheet SENSEI atau ATTENDANCE tidak ditemukan.' };
  }

  const senseiValues = senseiSheet.getDataRange().getValues();
  if (senseiValues.length < 2) return { success: false, message: 'Data sensei belum tersedia.' };
  const senseiHeaders = senseiValues[0].map(String);
  const senseiIdIndex = findColumnIndex_(senseiHeaders, ['ID_SENSEI']);
  const rateIndex = findColumnIndex_(senseiHeaders, ['TARIF_PER_JAM']);
  if (senseiIdIndex < 0 || rateIndex < 0) {
    return { success: false, message: 'Kolom ID_SENSEI atau TARIF_PER_JAM tidak ditemukan.' };
  }
  const sensei = senseiValues.slice(1).find(function (row) {
    return String(row[senseiIdIndex] || '').trim().toUpperCase() === String(record.ID_SENSEI || '').trim().toUpperCase();
  });
  if (!sensei || rateIndex < 0) return { success: false, message: 'Sensei atau tarif per JP tidak ditemukan.' };

  const rate = Number(sensei[rateIndex]);
  if (!Number.isFinite(rate) || rate <= 0) {
    return { success: false, message: 'Tarif per JP sensei harus lebih dari 0.' };
  }

  const period = periodKey_(record.PERIOD);
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return { success: false, message: 'Periode payroll harus menggunakan format bulan dan tahun.' };
  }

  const attendanceValues = attendanceSheet.getDataRange().getValues();
  if (!attendanceValues.length) return { success: false, message: 'Header sheet ATTENDANCE belum tersedia.' };
  const headers = attendanceValues[0].map(String);
  const actorIdIndex = findColumnIndex_(headers, ['ACTOR_ID']);
  const actorTypeIndex = findColumnIndex_(headers, ['ACTOR_TYPE']);
  const dateIndex = findColumnIndex_(headers, ['TANGGAL']);
  const statusIndex = findColumnIndex_(headers, ['STATUS']);
  const startIndex = findColumnIndex_(headers, ['JAM_MASUK']);
  const endIndex = findColumnIndex_(headers, ['JAM_KELUAR']);
  if ([actorIdIndex, actorTypeIndex, dateIndex, statusIndex, startIndex, endIndex].some(function (index) { return index < 0; })) {
    return { success: false, message: 'Kolom absensi untuk perhitungan JP belum lengkap.' };
  }

  const bsIdx = findColumnIndex_(headers, ['ISTIRAHAT_MULAI']);
  const beIdx = findColumnIndex_(headers, ['ISTIRAHAT_SELESAI']);

  let meetingCount = 0;
  let totalMinutes = 0;
  let incompleteTimes = 0;
  attendanceValues.slice(1).forEach(function (row) {
    const status = String(row[statusIndex] || '').trim().toUpperCase();
    if (String(row[actorIdIndex] || '').trim().toUpperCase() !== String(record.ID_SENSEI || '').trim().toUpperCase()) return;
    if (attendanceActorType_(row[actorTypeIndex]) !== 'SENSEI') return;
    if (periodKey_(row[dateIndex]) !== period) return;
    if (status !== 'HADIR' && status !== 'TERLAMBAT') return;

    meetingCount += 1;
    let breaksArr = [];
    const jsonIdx = findColumnIndex_(headers, ['ISTIRAHAT_JSON']);
    if (jsonIdx >= 0 && row[jsonIdx]) {
      try { breaksArr = JSON.parse(row[jsonIdx]); } catch (e) { breaksArr = []; }
    }
    if (!breaksArr.length && bsIdx >= 0 && beIdx >= 0 && row[bsIdx] && row[beIdx]) {
      breaksArr.push([clockLabel_(clockMinutes_(row[bsIdx])), clockLabel_(clockMinutes_(row[beIdx]))]);
    }
    const paidMinutes = paidTeachingMinutes_(clockMinutes_(row[startIndex]), clockMinutes_(row[endIndex]), breaksArr);
    if (paidMinutes === null) {
      incompleteTimes += 1;
      return;
    }
    totalMinutes += paidMinutes;
  });

  if (incompleteTimes) {
    return { success: false, message: incompleteTimes + ' absensi hadir sensei belum memiliki waktu masuk dan keluar.' };
  }

  const jpCount = Math.round((totalMinutes / 45) * 100) / 100;
  const baseAmount = Math.round(jpCount * rate);
  const bonus = Number(record.BONUS || 0);
  const transport = Number(record.TRANSPORT || 0);
  const deduction = Number(record.DEDUCTION || 0);
  if (!Number.isFinite(bonus) || !Number.isFinite(transport) || !Number.isFinite(deduction)) {
    return { success: false, message: 'Bonus, transport, dan potongan harus berupa angka.' };
  }

  return {
    success: true,
    data: {
      MEETING_COUNT: meetingCount,
      HOUR_COUNT: jpCount,
      BASE_AMOUNT: baseAmount,
      NET_SALARY: baseAmount + bonus + transport - deduction
    }
  };
}

function saveSheetRecord_(sheetName, keyField, payload) {
  const sh = ss_().getSheetByName(sheetName);
  if (!sh) return { success: false, message: 'Sheet not found: ' + sheetName };

  let values = sh.getDataRange().getValues();
  if (!values.length) return { success: false, message: 'Header sheet ' + sheetName + ' belum tersedia.' };

  let headers = values[0].map(function (header) { return String(header || '').trim(); });

  // --- AUTO-CREATE KOLOM BARU JIKA BELUM ADA ---
  let isModified = false;
  if (sheetName === 'BILLING' && findColumnIndex_(headers, ['PENERIMA']) < 0) {
    sh.getRange(1, sh.getLastColumn() + 1).setValue('PENERIMA');
    isModified = true;
  }
  if (sheetName === 'PAYMENTS' && findColumnIndex_(headers, ['REFERENCE_NO']) < 0) {
    sh.getRange(1, sh.getLastColumn() + 1).setValue('REFERENCE_NO');
    isModified = true;
  }
  if (sheetName === 'SALARY' && findColumnIndex_(headers, ['PENERIMA']) < 0) {
    sh.getRange(1, sh.getLastColumn() + 1).setValue('PENERIMA');
    isModified = true;
  }

  if (isModified) {
    values = sh.getDataRange().getValues();
    headers = values[0].map(function (header) { return String(header || '').trim(); });
  }
  // ---------------------------------------------

  const keyIndex = findColumnIndex_(headers, [keyField]);
  if (keyIndex < 0) return { success: false, message: 'Kolom ' + keyField + ' tidak ditemukan.' };

  // ... (sisa kode di bawahnya biarkan sama seperti sebelumnya)

  const record = Object.assign({}, payload && typeof payload === 'object' ? payload : {});
  const mode = String(record.__MODE || 'upsert');
  const missing = requiredFields_(sheetName).filter(function (field) {
    return String(record[field] || '').trim() === '';
  });
  if (missing.length) {
    return { success: false, message: 'Kolom wajib belum diisi: ' + missing.join(', ') };
  }

  if (sheetName === 'FINANCE') {
    const date = String(record.DATE || '').trim();
    const amount = Number(record.AMOUNT);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(new Date(date + 'T00:00:00').getTime())) {
      return { success: false, message: 'Tanggal mutasi harus valid.' };
    }
    if (['PEMASUKAN', 'PENGELUARAN'].indexOf(String(record.TYPE || '').trim().toUpperCase()) < 0) {
      return { success: false, message: 'Jenis mutasi harus berupa PEMASUKAN atau PENGELUARAN.' };
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      return { success: false, message: 'Nominal mutasi harus lebih dari 0.' };
    }
  }

  if (sheetName === 'ATTENDANCE' && attendanceActorType_(record.ACTOR_TYPE) === 'SENSEI') {
    const status = String(record.STATUS || '').trim().toUpperCase();
    if (status === 'HADIR' || status === 'TERLAMBAT') {
      const start = clockMinutes_(record.JAM_MASUK);
      const end = clockMinutes_(record.JAM_KELUAR);
      if (start === null || end === null) {
        return { success: false, message: 'Absensi hadir sensei wajib memiliki jam mulai dan selesai yang valid.' };
      }
      if (start === end) {
        return { success: false, message: 'Jam mulai dan selesai tidak boleh sama.' };
      }

      let breaksToValidate = [];
      if (record.ISTIRAHAT_JSON) {
        try { breaksToValidate = JSON.parse(record.ISTIRAHAT_JSON); } catch (e) { breaksToValidate = []; }
      } else if (record.ISTIRAHAT_MULAI || record.ISTIRAHAT_SELESAI) {
        if (record.ISTIRAHAT_MULAI && record.ISTIRAHAT_SELESAI) {
          breaksToValidate.push([record.ISTIRAHAT_MULAI, record.ISTIRAHAT_SELESAI]);
        } else {
          return { success: false, message: 'Istirahat harus diisi lengkap (mulai dan selesai).' };
        }
      }
      for (let bi = 0; bi < breaksToValidate.length; bi += 1) {
        const b = breaksToValidate[bi];
        if (!Array.isArray(b) || b.length < 2) continue;
        const bs = clockMinutes_(b[0]);
        const be = clockMinutes_(b[1]);
        if (bs === null || be === null) {
          return { success: false, message: 'Format jam istirahat tidak valid.' };
        }
        if (bs === be) {
          return { success: false, message: 'Jam istirahat mulai dan selesai tidak boleh sama.' };
        }
      }
    }
  }

  if (sheetName === 'SALARY') {
    const calculation = calculateSalaryRecord_(record);
    if (!calculation.success) return calculation;
    Object.assign(record, calculation.data);
  }

  const requestedKey = String(record[keyField] || '').trim();
  const requestedRow = Number(record.__ROW_NUMBER);
  let rowNumber = Number.isInteger(requestedRow) && requestedRow >= 2 && requestedRow <= sh.getLastRow()
    ? requestedRow
    : 0;

  if (rowNumber && requestedKey) {
    const existingKey = String(sh.getRange(rowNumber, keyIndex + 1).getValue() || '').trim();
    if (existingKey !== requestedKey) {
      return { success: false, message: 'Data berubah sejak dibuka. Muat ulang lalu coba lagi.' };
    }
  }

  if (!rowNumber && requestedKey) {
    for (let i = 1; i < values.length; i += 1) {
      if (String(values[i][keyIndex] || '').trim() === requestedKey) {
        rowNumber = i + 1;
        break;
      }
    }
  }

  if (mode === 'update' && !rowNumber) {
    return { success: false, message: 'Data yang akan diperbarui tidak ditemukan.' };
  }
  if (mode === 'create' && rowNumber) {
    return { success: false, message: 'ID tersebut sudah digunakan.' };
  }

  const isUpdate = rowNumber > 0;
  const row = isUpdate
    ? sh.getRange(rowNumber, 1, 1, headers.length).getValues()[0]
    : new Array(headers.length).fill('');

  let finalKey = requestedKey || String(row[keyIndex] || '').trim();
  if (!finalKey) {
    if (sheetName === 'STUDENTS' || sheetName === 'SENSEI') {
      const nameIdx = findColumnIndex_(headers, ['NAMA', 'NAME']);
      const phoneIdx = findColumnIndex_(headers, ['NO_WA', 'NO_HP', 'PHONE', 'WHATSAPP', 'WA', 'HP', 'TELP']);
      const nameVal = nameIdx >= 0 ? record[headers[nameIdx]] : '';
      const phoneVal = phoneIdx >= 0 ? record[headers[phoneIdx]] : '';
      const generated = generatedAccountId_(nameVal, phoneVal);
      if (generated.success) {
        const used = values.slice(1).some(function (r) {
          return String(r[keyIndex] || '').trim().toUpperCase() === generated.id.toUpperCase();
        });
        if (!used) finalKey = generated.id;
      }
    }
    if (!finalKey) finalKey = nextRecordId_(sheetName, values, keyIndex);
  }

  headers.forEach(function (header, index) {
    if (Object.prototype.hasOwnProperty.call(record, header) && header !== '__ROW_NUMBER') {
      row[index] = normalizeRecordValue_(header, record[header]);
    }
  });

  if (!String(row[keyIndex] || '').trim()) row[keyIndex] = finalKey;

  const createdIndex = findColumnIndex_(headers, ['CREATED_AT']);
  const updatedIndex = findColumnIndex_(headers, ['UPDATED_AT']);
  if (!isUpdate && createdIndex >= 0 && !row[createdIndex]) row[createdIndex] = new Date();
  if (updatedIndex >= 0) row[updatedIndex] = new Date();

  if (isUpdate) {
    sh.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  } else {
    sh.appendRow(row);
    rowNumber = sh.getLastRow();
  }

  if (sheetName === 'PAYMENTS') {
    const paymentObj = {};
    headers.forEach(function (header, idx) { paymentObj[header] = row[idx]; });
    paymentObj.PAYMENT_ID = String(row[keyIndex] || finalKey);

    const syncResult = syncPaymentToFinance_(paymentObj);
    if (!syncResult.success) {
      console.warn('Gagal sync pembayaran ke FINANCE:', syncResult.message);
    }

    try {
      updateBillingStatusFromPayments_(String(paymentObj.BILLING_ID || '').trim());
    } catch (err) {
      console.warn('Gagal update status BILLING:', err && err.message ? err.message : err);
    }
  }

  return {
    success: true,
    message: isUpdate ? 'Data berhasil diperbarui.' : 'Data berhasil ditambahkan.',
    data: { [keyField]: row[keyIndex], __ROW_NUMBER: rowNumber }
  };
}

function syncPaymentToFinance_(payment) {
  const sheetResult = financeSheet_();
  if (!sheetResult.success) return { success: false, message: sheetResult.message };

  const financeRows = listSheet_('FINANCE');
  if (!financeRows.success) return financeRows;

  const paymentId = String(payment.PAYMENT_ID || '').trim();
  if (!paymentId) return { success: false, message: 'PAYMENT_ID kosong, tidak dapat sync ke FINANCE.' };

  const existing = (financeRows.data || []).find(function (row) {
    return String(row.REFERENCE_NO || '').trim().toUpperCase() === paymentId.toUpperCase();
  });
  if (existing) {
    return { success: true, skipped: true, message: 'Mutasi keuangan untuk pembayaran ini sudah tercatat.' };
  }

  const billingSheet = ss_().getSheetByName('BILLING');
  let billingCategory = '';
  if (billingSheet) {
    const billingValues = billingSheet.getDataRange().getValues();
    if (billingValues.length > 1) {
      const headers = billingValues[0].map(String);
      const idIdx = findColumnIndex_(headers, ['BILLING_ID']);
      const catIdx = findColumnIndex_(headers, ['CATEGORY']);
      if (idIdx >= 0 && catIdx >= 0) {
        const found = billingValues.slice(1).find(function (row) {
          return String(row[idIdx] || '').trim() === String(payment.BILLING_ID || '').trim();
        });
        if (found) billingCategory = String(found[catIdx] || '').trim();
      }
    }
  }

  const transactionId = 'FIN-' + paymentId;
  const today = Utilities.formatDate(new Date(), ARIMA.TIMEZONE, 'yyyy-MM-dd');

  const financeRecord = {
    TRANSACTION_ID: transactionId,
    DATE: String(payment.PAYMENT_DATE || today).slice(0, 10) || today,
    TYPE: 'PEMASUKAN',
    CATEGORY: billingCategory || 'SPP',
    DESCRIPTION: 'Pembayaran ' + paymentId + (payment.BILLING_ID ? ' untuk tagihan ' + payment.BILLING_ID : ''),
    AMOUNT: Number(payment.AMOUNT || 0),
    PAYMENT_METHOD: String(payment.PAYMENT_METHOD || 'LAINNYA'),
    REFERENCE_NO: paymentId,
    NOTES: String(payment.NOTES || ''),
    __MODE: 'create'
  };

  return saveSheetRecord_('FINANCE', 'TRANSACTION_ID', financeRecord);
}

function updateBillingStatusFromPayments_(billingId) {
  if (!billingId) return;
  const billingSheet = ss_().getSheetByName('BILLING');
  const paymentsSheet = ss_().getSheetByName('PAYMENTS');
  if (!billingSheet || !paymentsSheet) return;

  const bValues = billingSheet.getDataRange().getValues();
  if (bValues.length < 2) return;
  const bHeaders = bValues[0].map(String);
  const bIdIdx = findColumnIndex_(bHeaders, ['BILLING_ID']);
  const bAmountIdx = findColumnIndex_(bHeaders, ['AMOUNT']);
  const bStatusIdx = findColumnIndex_(bHeaders, ['STATUS']);
  if (bIdIdx < 0 || bStatusIdx < 0) return;

  let rowNum = 0;
  let totalBill = 0;
  for (let i = 1; i < bValues.length; i += 1) {
    if (String(bValues[i][bIdIdx] || '').trim() === billingId) {
      rowNum = i + 1;
      totalBill = Number(bValues[i][bAmountIdx] || 0);
      break;
    }
  }
  if (!rowNum) return;

  const pValues = paymentsSheet.getDataRange().getValues();
  if (pValues.length < 2) return;
  const pHeaders = pValues[0].map(String);
  const pBillingIdx = findColumnIndex_(pHeaders, ['BILLING_ID']);
  const pAmountIdx = findColumnIndex_(pHeaders, ['AMOUNT']);
  if (pBillingIdx < 0 || pAmountIdx < 0) return;

  let totalPaid = 0;
  for (let i = 1; i < pValues.length; i += 1) {
    if (String(pValues[i][pBillingIdx] || '').trim() === billingId) {
      totalPaid += Number(pValues[i][pAmountIdx] || 0);
    }
  }

  let newStatus = 'BELUM BAYAR';
  if (totalBill > 0 && totalPaid >= totalBill) newStatus = 'LUNAS';
  else if (totalPaid > 0) newStatus = 'CICILAN';

  billingSheet.getRange(rowNum, bStatusIdx + 1).setValue(newStatus);
}

function deleteBillingRecord_(payload) {
  const record = payload && typeof payload === 'object' ? payload : {};
  const billingId = String(record.BILLING_ID || '').trim();
  if (!billingId) return { success: false, message: 'BILLING_ID wajib diisi.' };

  const paymentsSheet = ss_().getSheetByName('PAYMENTS');
  if (paymentsSheet && paymentsSheet.getLastRow() > 1) {
    const values = paymentsSheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const billingIdx = findColumnIndex_(headers, ['BILLING_ID']);
    if (billingIdx >= 0) {
      const relatedPayments = values.slice(1).filter(function (row) {
        return String(row[billingIdx] || '').trim() === billingId;
      });
      if (relatedPayments.length) {
        return {
          success: false,
          message: 'Tagihan tidak dapat dihapus karena sudah memiliki ' + relatedPayments.length +
                   ' pembayaran tercatat. Hapus pembayaran terkait terlebih dahulu jika memang diperlukan.'
        };
      }
    }
  }

  return deleteSheetRecord_('BILLING', 'BILLING_ID', payload);
}

function deletePaymentRecord_(payload) {
  const record = payload && typeof payload === 'object' ? payload : {};
  const paymentId = String(record.PAYMENT_ID || '').trim();
  if (!paymentId) return { success: false, message: 'PAYMENT_ID wajib diisi.' };

  const financeSheet = ss_().getSheetByName('FINANCE');
  if (financeSheet && financeSheet.getLastRow() > 1) {
    const values = financeSheet.getDataRange().getValues();
    const headers = values[0].map(String);
    const refIdx = findColumnIndex_(headers, ['REFERENCE_NO']);
    if (refIdx >= 0) {
      for (let i = values.length - 1; i >= 1; i -= 1) {
        if (String(values[i][refIdx] || '').trim().toUpperCase() === paymentId.toUpperCase()) {
          financeSheet.deleteRow(i + 1);
        }
      }
    }
  }

  return deleteSheetRecord_('PAYMENTS', 'PAYMENT_ID', payload);
}

function emailSalarySlip_(payload) {
  const record = payload && typeof payload === 'object' ? payload : {};
  const salaryId = String(record.SALARY_ID || '').trim();
  const pdfBase64 = String(record.pdfBase64 || '').trim();

  if (!salaryId) return { success: false, message: 'SALARY_ID wajib diisi.' };
  if (!pdfBase64) return { success: false, message: 'File PDF slip gaji tidak tersedia.' };

  const salarySheet = ss_().getSheetByName('SALARY');
  if (!salarySheet) return { success: false, message: 'Sheet SALARY tidak ditemukan.' };
  const salaryValues = salarySheet.getDataRange().getValues();
  if (salaryValues.length < 2) return { success: false, message: 'Data payroll belum tersedia.' };
  const salaryHeaders = salaryValues[0].map(String);
  const salaryIdIdx = findColumnIndex_(salaryHeaders, ['SALARY_ID']);
  const salaryRow = salaryValues.slice(1).find(function (row) {
    return String(row[salaryIdIdx] || '').trim() === salaryId;
  });
  if (!salaryRow) return { success: false, message: 'Data payroll tidak ditemukan.' };

  const salaryObj = {};
  salaryHeaders.forEach(function (header, idx) { salaryObj[header] = salaryRow[idx]; });

  const senseiSheet = ss_().getSheetByName('SENSEI');
  if (!senseiSheet) return { success: false, message: 'Sheet SENSEI tidak ditemukan.' };
  const senseiValues = senseiSheet.getDataRange().getValues();
  const senseiHeaders = senseiValues[0].map(String);
  const senseiIdIdx = findColumnIndex_(senseiHeaders, ['ID_SENSEI']);
  const senseiNameIdx = findColumnIndex_(senseiHeaders, ['NAMA']);
  const senseiEmailIdx = findColumnIndex_(senseiHeaders, ['EMAIL']);
  const senseiRow = senseiValues.slice(1).find(function (row) {
    return String(row[senseiIdIdx] || '').trim() === String(salaryObj.ID_SENSEI || '').trim();
  });
  if (!senseiRow) return { success: false, message: 'Data sensei tidak ditemukan.' };

  const senseiName = String(senseiRow[senseiNameIdx] || 'Sensei');
  const senseiEmail = String(senseiRow[senseiEmailIdx] || '').trim();
  if (!senseiEmail || senseiEmail.indexOf('@') < 0) {
    return { success: false, message: 'Email sensei belum diisi atau tidak valid di data master.' };
  }

  const period = String(salaryObj.PERIOD || '').slice(0, 7);
  const subject = 'Slip Gaji ' + period + ' - LPKS Arima Persada';
  const bodyText = 'Yth. ' + senseiName + ',\n\n' +
    'Terlampir slip gaji periode ' + period + '.\n\n' +
    'Terima kasih.\nLPKS Arima Persada';
  const bodyHtml = '<p>Yth. <strong>' + senseiName + '</strong>,</p>' +
    '<p>Terlampir slip gaji periode <strong>' + period + '</strong>.</p>' +
    '<p>Terima kasih.<br>LPKS Arima Persada</p>';

  const fileName = 'slip-gaji-' + salaryId + '.pdf';

  try {
    MailApp.sendEmail({
      to: senseiEmail,
      subject: subject,
      body: bodyText,
      htmlBody: bodyHtml,
      name: 'LPKS Arima Persada',
      attachments: [Utilities.newBlob(
        Utilities.base64Decode(pdfBase64),
        'application/pdf',
        fileName
      )]
    });
  } catch (err) {
    return { success: false, message: 'Gagal mengirim email: ' + (err && err.message ? err.message : err) };
  }

  return {
    success: true,
    message: 'Slip gaji berhasil dikirim ke ' + senseiEmail + '.',
    data: { email: senseiEmail, salaryId: salaryId }
  };
}

function deleteSheetRecord_(sheetName, keyField, payload) {
  const sh = ss_().getSheetByName(sheetName);
  if (!sh) return { success: false, message: 'Sheet not found: ' + sheetName };
  if (sh.getLastRow() < 2 || sh.getLastColumn() < 1) {
    return { success: false, message: 'Belum ada data untuk dihapus.' };
  }

  const headers = sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(function (header) {
    return String(header || '').trim();
  });
  const keyIndex = findColumnIndex_(headers, [keyField]);
  if (keyIndex < 0) return { success: false, message: 'Kolom ' + keyField + ' tidak ditemukan.' };

  const record = payload && typeof payload === 'object' ? payload : {};
  const key = String(record[keyField] || '').trim();
  const requestedRow = Number(record.__ROW_NUMBER);
  let rowNumber = Number.isInteger(requestedRow) && requestedRow >= 2 && requestedRow <= sh.getLastRow()
    ? requestedRow
    : 0;

  if (rowNumber && key) {
    const existingKey = String(sh.getRange(rowNumber, keyIndex + 1).getValue() || '').trim();
    if (existingKey !== key) {
      return { success: false, message: 'Data berubah sejak dibuka. Muat ulang lalu coba lagi.' };
    }
  }

  if (!rowNumber && key) {
    const values = sh.getRange(2, keyIndex + 1, sh.getLastRow() - 1, 1).getValues();
    for (let i = 0; i < values.length; i += 1) {
      if (String(values[i][0] || '').trim() === key) {
        rowNumber = i + 2;
        break;
      }
    }
  }

  if (!rowNumber) return { success: false, message: 'Data tidak ditemukan.' };
  sh.deleteRow(rowNumber);
  return { success: true, message: 'Data berhasil dihapus.' };
}

function dashboard_() {
  return {
    success: true,
    data: {
      students: countActive_('STUDENTS', 'STATUS', 'AKTIF'),
      sensei: countActive_('SENSEI', 'STATUS', 'AKTIF'),
      attendance: 0,
      pendingBilling: 0
    }
  };
}

function normalizeHeaderName_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

function findColumnIndex_(headers, candidates) {
  const normalizedCandidates = (candidates || []).map(function (candidate) {
    return normalizeHeaderName_(candidate);
  });

  for (let i = 0; i < headers.length; i += 1) {
    const header = normalizeHeaderName_(headers[i]);
    if (normalizedCandidates.indexOf(header) >= 0) {
      return i;
    }
  }

  return -1;
}

function countActive_(sheetName, statusCol, statusValue) {
  const sh = ss_().getSheetByName(sheetName);
  if (!sh) return 0;

  const values = sh.getDataRange().getValues();
  if (values.length < 2) return 0;

  const headers = values[0].map(String);
  const index = findColumnIndex_(headers, [statusCol, 'STATUS', 'STATUS_SISWA', 'STATUS_SENSEI']);
  if (index < 0) {
    return values.slice(1).filter(function (row) {
      return row.some(function (cell) {
        return String(cell || '').trim() !== '';
      });
    }).length;
  }

  return values.slice(1).filter(function (row) {
    return String(row[index] || '').trim().toUpperCase() === String(statusValue || '').trim().toUpperCase();
  }).length;
}

function setupInitialAdmin() {
  const result = createInitialAdmin_();
  Logger.log(JSON.stringify(result));
  return result.created ? { success: true, created: true, message: 'Lihat View > Logs untuk password awal.' } : result;
}

function testSpreadsheetConnection() {
  const workbook = ss_();
  const users = workbook.getSheetByName('USERS');
  const result = {
    success: !!workbook,
    spreadsheetId: ARIMA.SPREADSHEET_ID,
    usersSheetExists: !!users,
    usersCount: users ? users.getLastRow() - 1 : 0
  };
  Logger.log(JSON.stringify(result));
  return result;
}
