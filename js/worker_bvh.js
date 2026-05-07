#!/bin/bash

# 1. Khai báo thông tin tuyệt đối
LOG="/home/gnkxdqkvhosting/public_html/log_github.txt"
GIT="/usr/bin/git"
DIR="/home/gnkxdqkvhosting/public_html"
TOKEN="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"
USER="vnboottop-byte"
REPO="TamGioi_Project"

# Xóa log cũ, ghi dòng đầu tiên
echo "=== KIỂM TRA MỚI: $(date) ===" > $LOG

# 2. Khai báo môi trường (Cực kỳ quan trọng cho Cron)
export HOME=/home/gnkxdqkvhosting
export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
echo "-> Đã nạp môi trường" >> $LOG

# 3. Vào thư mục
cd $DIR >> $LOG 2>&1
echo "-> Đang ở thư mục: $(pwd)" >> $LOG

# 4. Cấu hình an toàn
$GIT config --global --add safe.directory $DIR >> $LOG 2>&1
echo "-> Đã cấu hình safe directory" >> $LOG

# 5. Thử Add và Commit (Ghi lại mọi phản hồi từ Git)
$GIT add . >> $LOG 2>&1
echo "-> Đã Add file" >> $LOG

$GIT commit -m "Auto Sync: $(date +'%H:%M:%S')" >> $LOG 2>&1
echo "-> Đã Commit" >> $LOG

# 6. Đẩy lên GitHub (Dùng URL đầy đủ để tránh hỏi mật khẩu)
$GIT push https://$USER:$TOKEN@github.com/$USER/$REPO.git main --force >> $LOG 2>&1

echo "=== KẾT THÚC TIẾN TRÌNH ===" >> $LOG