/**
 * AI Workshop 2026 - Form Validation Script
 * Yêu cầu:
 * 1. Không được để trống bất kỳ trường nào.
 * 2. Email phải đúng định dạng (@gmail.com...).
 * 3. Số điện thoại phải có đúng 10 chữ số.
 * 4. Nếu thông tin sai, hiển thị thông báo lỗi màu đỏ ngay dưới ô Input.
 * 5. Nếu đúng, hiển thị thông báo 'Đang xử lý...'.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registrationForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnText = submitBtn.querySelector('.btn__text');
  const statusMessage = document.getElementById('statusMessage');
  const ticketSelect = document.getElementById('ticketType');
  const ticketInfoEl = document.getElementById('ticketInfo');
  const successToast = document.getElementById('successToast');

  // Dữ liệu bảng giá & quyền lợi các loại vé
  const ticketData = {
    vip: {
      price: '2.500.000 ₫',
      perks: 'Ghế ưu tiên • Bữa tối Networking • Quà tặng VIP',
    },
    standard: {
      price: '800.000 ₫',
      perks: 'Toàn bộ phiên chính • Tài liệu kỹ thuật số',
    },
    student: {
      price: '200.000 ₫',
      perks: 'Xuất trình thẻ sinh viên • Hỗ trợ mentorship',
    },
  };

  // Cập nhật thông tin chi tiết khi chọn loại vé
  if (ticketSelect && ticketInfoEl) {
    ticketSelect.addEventListener('change', () => {
      const val = ticketSelect.value;
      if (!val || !ticketData[val]) {
        ticketInfoEl.innerHTML = '';
        return;
      }
      const { price, perks } = ticketData[val];
      ticketInfoEl.innerHTML = `
        <span class="chip chip--price">💰 ${price}</span>
        <span class="chip chip--perks">✨ ${perks}</span>
      `;
    });
  }

  /**
   * Hiển thị thông báo lỗi màu đỏ ngay dưới ô Input tương ứng
   */
  function showError(fieldId, message) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = 'flex';
    }

    if (inputEl) {
      inputEl.classList.add('form__input--error');
      inputEl.setAttribute('aria-invalid', 'true');
    }
  }

  /**
   * Xóa thông báo lỗi khi người dùng nhập lại hợp lệ
   */
  function clearError(fieldId) {
    const errorEl = document.getElementById(`${fieldId}-error`);
    const inputEl = document.getElementById(fieldId);

    if (errorEl) {
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }

    if (inputEl) {
      inputEl.classList.remove('form__input--error');
      inputEl.removeAttribute('aria-invalid');
    }
  }

  /**
   * Hàm kiểm tra từng trường theo tiêu chí đề bài
   * @param {string} fieldId - ID của ô input
   * @param {string} value - Giá trị nhập vào
   * @returns {boolean} - true nếu hợp lệ, false nếu có lỗi
   */
  function validateField(fieldId, value) {
    clearError(fieldId);
    const val = (value || '').trim();

    // 1. Kiểm tra không được để trống bất kỳ trường nào
    if (!val) {
      switch (fieldId) {
        case 'fullName':
          showError(fieldId, 'Họ và tên không được để trống.');
          break;
        case 'email':
          showError(fieldId, 'Email không được để trống.');
          break;
        case 'phone':
          showError(fieldId, 'Số điện thoại không được để trống.');
          break;
        case 'ticketType':
          showError(fieldId, 'Vui lòng chọn loại vé tham dự.');
          break;
      }
      return false;
    }

    // 2. Kiểm tra Email phải đúng định dạng (@gmail.com...)
    if (fieldId === 'email') {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) {
        showError(fieldId, 'Email không đúng định dạng (Ví dụ: user@gmail.com).');
        return false;
      }
    }

    // 3. Kiểm tra Số điện thoại phải có đúng 10 chữ số
    if (fieldId === 'phone') {
      const phoneDigits = val.replace(/\s+/g, ''); // Bỏ khoảng trắng nếu có
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phoneDigits)) {
        showError(fieldId, 'Số điện thoại phải có đúng 10 chữ số.');
        return false;
      }
    }

    return true;
  }

  // Danh sách các trường cần kiểm tra
  const fields = ['fullName', 'email', 'phone', 'ticketType'];

  // Lắng nghe sự kiện blur & input để kiểm tra trực tiếp (Real-time feedback)
  fields.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener('blur', () => {
      validateField(id, el.value);
    });

    el.addEventListener('input', () => {
      if (el.classList.contains('form__input--error')) {
        validateField(id, el.value);
      }
    });

    if (id === 'ticketType') {
      el.addEventListener('change', () => {
        validateField(id, el.value);
      });
    }
  });

  // Xử lý sự kiện Submit Form
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;

    // Kiểm tra tất cả các trường
    fields.forEach((id) => {
      const el = document.getElementById(id);
      const isValid = validateField(id, el.value);
      if (!isValid) {
        isFormValid = false;
      }
    });

    // Nếu có trường sai/trống, dừng lại
    if (!isFormValid) {
      // Focus vào trường đầu tiên bị lỗi
      const firstError = form.querySelector('.form__input--error');
      if (firstError) firstError.focus();
      return;
    }

    // 1. Khi đang gửi: Vô hiệu hóa nút (Disabled) và đổi chữ thành 'Loading...'
    submitBtn.disabled = true;
    if (btnText) {
      btnText.textContent = 'Loading...';
    }

    if (statusMessage) {
      statusMessage.className = 'status-message status-message--loading';
      statusMessage.innerHTML = `
        <span class="spinner" aria-hidden="true"></span>
        <span>Loading...</span>
      `;
      statusMessage.style.display = 'flex';
    }

    // URL Web App Google Apps Script
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx0w8rv75RlCBD4Z1HifRqm375q4ZB_5SbT1eaiR8MSP35fY5uPefJf2OjjrCHNUaD6/exec';

    const formData = {
      name: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      ticketType: document.getElementById('ticketType').value,
    };

    // 2. Sử dụng Fetch API gửi dữ liệu sang Google Apps Script
    // Dùng text/plain để vượt qua giới hạn CORS của trình duyệt khi gửi tới Google Apps Script
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(formData),
    })
      .then(() => {
        // 3. Sau khi gửi thành công:
        // - Xóa trắng Form (Reset)
        form.reset();
        if (ticketInfoEl) ticketInfoEl.innerHTML = '';

        // - Hiển thị thông báo chúc mừng
        if (successToast) {
          successToast.classList.add('toast--visible');
          setTimeout(() => {
            successToast.classList.remove('toast--visible');
          }, 4500);
        }
      })
      .catch((err) => {
        console.error('Lỗi khi gửi dữ liệu:', err);
        alert('Có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại!');
      })
      .finally(() => {
        // 4. Khôi phục lại trạng thái ban đầu của nút bấm và ẩn loading
        submitBtn.disabled = false;
        if (btnText) {
          btnText.textContent = 'Đăng Ký Ngay';
        }
        if (statusMessage) {
          statusMessage.style.display = 'none';
          statusMessage.textContent = '';
        }
      });
  });
});