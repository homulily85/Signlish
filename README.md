# Ứng dụng hỗ trợ trẻ khiếm thính học ngôn ngữ ký hiệu
## Thiết lập môi trường
### Frontend
```shell
cd frontend
# Cài đặt các gói phụ thuộc
npm i
```

### Backend
```shell
# Tạo và truy cập vào virtual enviroment
# Linux
cd backend
python3 -m venv ./.venv
source ./.venv/bin/activate

# Windows
cd backend
python -m venv .\.venv
.\.venv\Scripts\activate

# Cài đặt các gói phụ thuộc
pip install -r requirements.txt
```

####
Chạy mô hình nhận diện ký hiệu
```shell
cd ./backend
source ./.venv/bin/activate
# Cập nhật các gói phụ thuộc
pip install -r requirements.txt
# Chạy server backend
uvicorn main:app --reload 
Truy cập http://localhost:8000/processor/ để test mô hình nhận diện ký hiệu.
File html mẫu cho frontend nằm ở backend/service/SignLanguageProcessor/index.html
```

Lỗi hiện tại:
- Camera bị delay.
- Mô hình bị overfit