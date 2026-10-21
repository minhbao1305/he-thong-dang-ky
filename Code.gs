/**
 * ===================================================================
 * AI Workshop 2026 — Google Apps Script Web App Endpoint
 * ===================================================================
 * Nhận dữ liệu POST từ trang web và lưu vào Google Sheets
 * 
 * Các trường dữ liệu nhận được:
 * - name / fullName   : Họ và tên
 * - email             : Địa chỉ email
 * - phone             : Số điện thoại
 * - ticketType        : Loại vé (VIP / Standard / Student)
 * 
 * Phản hồi: JSON { "status": "success", "message": "...", ... }
 * ===================================================================
 */

/**
 * Xử lý yêu cầu POST gửi từ trang web
 * @param {Object} e - Sự kiện POST từ Google Apps Script
 * @returns {TextOutput} - Phản hồi JSON
 */
function doPost(e) {
  // Sử dụng LockService để tránh xung đột khi nhiều người đăng ký cùng lúc
  var lock = LockService.getScriptLock();
  
  try {
    // Chờ tối đa 10 giây để lấy quyền ghi dữ liệu
    lock.waitLock(10000);

    // 1. Lấy dữ liệu gửi lên (hỗ trợ cả JSON body lẫn FormData / URL-encoded)
    var data = {};
    
    if (e && e.postData && e.postData.contents) {
      try {
        // Trường hợp gửi bằng JSON: fetch(url, { body: JSON.stringify(...) })
        data = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        // Trường hợp gửi text thô hoặc x-www-form-urlencoded
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      // Trường hợp gửi qua FormData hoặc URL parameters
      data = e.parameter;
    }

    // Trích xuất các trường dữ liệu (hỗ trợ cả viết hoa lẫn viết thường)
    var name       = data.name || data.fullName || data.Name || '';
    var email      = data.email || data.Email || '';
    var phone      = data.phone || data.Phone || '';
    var ticketType = data.ticketType || data.TicketType || '';
    var timestamp  = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm:ss');

    // 2. Mở Google Sheet hiện tại
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Nếu bảng tính hoàn toàn mới (chưa có dữ liệu), tạo dòng tiêu đề trước
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Thời gian đăng ký', 'Họ và tên', 'Email', 'Số điện thoại', 'Loại vé']);
      
      // Định dạng dòng tiêu đề (in đậm, nền xanh công nghệ, chữ trắng)
      var headerRange = sheet.getRange(1, 1, 1, 5);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#007bff');
      headerRange.setFontColor('#ffffff');
      headerRange.setHorizontalAlignment('center');
      sheet.setFrozenRows(1);
    }

    // 3. Tự động chèn dòng dữ liệu mới vào cuối bảng tính
    sheet.appendRow([
      timestamp,
      name,
      email,
      "'" + phone, // Thêm dấu ' ở đầu để Google Sheets không làm mất số 0 ở đầu số điện thoại
      ticketType.toUpperCase()
    ]);

    // 4. Trả về phản hồi JSON thông báo thành công
    var responseOutput = ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Đăng ký thành công! Dữ liệu đã được lưu vào Google Sheets.',
      receivedData: {
        timestamp: timestamp,
        name: name,
        email: email,
        phone: phone,
        ticketType: ticketType
      }
    }));

    responseOutput.setMimeType(ContentService.MimeType.JSON);
    return responseOutput;

  } catch (error) {
    // Xử lý khi có lỗi xảy ra
    var errorOutput = ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    }));

    errorOutput.setMimeType(ContentService.MimeType.JSON);
    return errorOutput;

  } finally {
    // Luôn giải phóng lock để các yêu cầu tiếp theo được xử lý
    lock.releaseLock();
  }
}

/**
 * Xử lý kiểm tra kết nối nhanh bằng trình duyệt (GET test)
 */
function doGet(e) {
  var output = ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    message: 'AI Workshop 2026 API Web App is running! Sẵn sàng nhận POST request.'
  }));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
