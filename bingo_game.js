
        let maxNumber = 0;
        let availableNumbers = [];
        let drawnNumbers = [];
        let isSpinning = false;
        let currentDisplayNumber = '?';

        // Tạo âm thanh (sử dụng Web Audio API)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create confetti effect
        function createConfetti() {
            const container = document.querySelector('.container');
            const rect = container.getBoundingClientRect();

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];

            for (let i = 0; i < 200; i++) {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';

                // đặt tại tâm container
                confetti.style.left = centerX + 'px';
                confetti.style.top = centerY + 'px';

                // màu + kích thước
                confetti.style.background =
                    colors[Math.floor(Math.random() * colors.length)];
                confetti.style.width = Math.random() * 8 + 4 + 'px';
                confetti.style.height = Math.random() * 8 + 4 + 'px';
                confetti.style.borderRadius = '2px';

                // hướng bay ngẫu nhiên
                const angle = Math.random() * 2 * Math.PI;
                const distance = Math.random() * 300 + 100;

                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;

                // truyền biến cho CSS
                confetti.style.setProperty('--x', `${x}px`);
                confetti.style.setProperty('--y', `${y}px`);

                confetti.style.animation = 'confettiExplode 1.5s ease-out forwards';

                container.appendChild(confetti);

                // xóa sau khi xong
                setTimeout(() => confetti.remove(), 1500);
            }
        }

        // Hàm lưu dữ liệu vào SessionStorage
        function saveGameState() {
            const gameState = {
                maxNumber: maxNumber,
                availableNumbers: availableNumbers,
                drawnNumbers: drawnNumbers,
                currentDisplayNumber: currentDisplayNumber
            };
            sessionStorage.setItem('bingoGameState', JSON.stringify(gameState));
        }

        // Hàm tải dữ liệu từ SessionStorage
        function loadGameState() {
            const savedState = sessionStorage.getItem('bingoGameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                maxNumber = gameState.maxNumber;
                availableNumbers = gameState.availableNumbers || [];
                drawnNumbers = gameState.drawnNumbers || [];
                currentDisplayNumber = gameState.currentDisplayNumber || '?';
                return true;
            }
            return false;
        }

        // Hàm khôi phục giao diện từ dữ liệu đã lưu
        function restoreUI() {
            if (maxNumber > 0) {
                document.getElementById('maxNumber').value = maxNumber;
                document.getElementById('maxNumber').disabled = true;
                document.getElementById('setMaxBtn').disabled = true;
                document.getElementById('rangeDisplay').textContent = `1 - ${maxNumber}`;
                document.getElementById('drawnCount').textContent = drawnNumbers.length;
                document.getElementById('remainingCount').textContent = availableNumbers.length;
                document.getElementById('currentNumber').textContent = currentDisplayNumber;
                document.getElementById('startBtn').style.display = 'inline-block';
                document.getElementById('resetBtn').style.display = 'inline-block';
                document.getElementById('setMaxBtn').style.display = 'none';

                // Khôi phục lịch sử các số đã quay
                const historyEl = document.getElementById('historyNumbers');
                historyEl.innerHTML = '';
                // Hiển thị theo thứ tự mới nhất trước
                for (let i = drawnNumbers.length - 1; i >= 0; i--) {
                    const numberEl = document.createElement('div');
                    numberEl.className = 'history-number';
                    numberEl.textContent = drawnNumbers[i];
                    historyEl.appendChild(numberEl);
                }

                // Vô hiệu hóa button start nếu đã hết số
                if (availableNumbers.length === 0) {
                    document.getElementById('startBtn').disabled = true;
                }
            }
        }

        // Tải dữ liệu khi trang được load
        window.addEventListener('load', function() {
            if (loadGameState()) {
                restoreUI();
            }
        });

        function playWinSound() {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        }

        // Khởi tạo game
        document.getElementById('setMaxBtn').addEventListener('click', function() {
            const input = document.getElementById('maxNumber');
            const value = parseInt(input.value);
            
            if (value < 1 || isNaN(value)) {
                alert('Vui lòng nhập số Max hợp lệ (>= 1)');
                return;
            }
            
            maxNumber = value;
            availableNumbers = Array.from({length: maxNumber}, (_, i) => i + 1);
            drawnNumbers = [];
            
            document.getElementById('rangeDisplay').textContent = `1 - ${maxNumber}`;
            document.getElementById('drawnCount').textContent = '0';
            document.getElementById('remainingCount').textContent = maxNumber;
            document.getElementById('historyNumbers').innerHTML = '';
            document.getElementById('currentNumber').textContent = '?';
            
            document.getElementById('startBtn').style.display = 'inline-block';
            document.getElementById('resetBtn').style.display = 'inline-block';
            document.getElementById('setMaxBtn').style.display = 'none';

            input.disabled = true;
            this.disabled = true;

            // Lưu trạng thái
            saveGameState();
        });

        const bellImg = document.getElementById("bell");

        // Ảnh chuông mặc định
        const bellImageNormal = "images/gift_close.png";

        // Ảnh chuông sau khi quay xong
        const bellImageWin = "images/gift_open.png"; // <-- thay bằng file ảnh của bạn


        // Quay số
        document.getElementById('startBtn').addEventListener('click', function () {
            if (isSpinning || availableNumbers.length === 0) return;

            isSpinning = true;
            this.disabled = true;

            // playSpinSound();

            const bell = document.getElementById("bell");
            const sound = document.getElementById("bellSound");

            bellImg.src = bellImageNormal;

            bell.classList.add("ringing");
            sound.currentTime = 0;
            sound.play();

            // QUAY SỐ TRONG 5 GIÂY KHỚP VỚI RUNG CHUÔNG
            const currentNumberEl = document.getElementById('currentNumber');
            // currentNumberEl.classList.add('spin-animation');

            // reset để có thể phát hiệu ứng lại mỗi lần
            currentNumberEl.classList.remove("bingo-animate");

            let counter = 0;
            const maxSpins = 90; // 50 lần * 100ms = 5 giây
            const intervalTime = 100; // 100ms

            const spinInterval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                currentNumberEl.textContent = availableNumbers[randomIndex];

                counter++;

                if (counter >= maxSpins) {
                    clearInterval(spinInterval);

                    // Chọn số cuối cùng
                    const finalIndex = Math.floor(Math.random() * availableNumbers.length);
                    const drawnNumber = availableNumbers[finalIndex];
                    currentNumberEl.textContent = drawnNumber;

                 // Loại bỏ số đã quay
                    availableNumbers.splice(finalIndex, 1);
                    drawnNumbers.push(drawnNumber);
                    currentDisplayNumber = drawnNumber;

                 // Lưu trạng thái
                    saveGameState();

                 // Cập nhật hiển thị
                    updateDisplay(drawnNumber);

                    createConfetti();

                    setTimeout(() => {
                        // currentNumberEl.classList.remove('spin-animation');
                       isSpinning = false;

                       if (availableNumbers.length > 0) {
                            document.getElementById('startBtn').disabled = false;
                       } else {
                            playWinSound();
                            setTimeout(() => {
                               alert('🎉 Đã quay hết tất cả các số! 🎉');
                            }, 100);
                        }
                    }, 500);


                    // kích hoạt lại sau 10ms
                    setTimeout(() => {
                        currentNumberEl.classList.add("bingo-animate");
                        bellImg.src = bellImageWin;
                    }, 9);
                    // tắt hiệu ứng sau 1.2 giây
                    setTimeout(() => {
                        currentNumberEl.classList.remove("bingo-animate");
                    }, 2);
                }
            }, intervalTime);

            // Dừng rung chuông đúng 5 giây
            setTimeout(() => {
                bell.classList.remove("ringing");
            }, maxSpins * intervalTime); // = 5000ms = 5 giây
        });

        function updateDisplay(number) {
            document.getElementById('drawnCount').textContent = drawnNumbers.length;
            document.getElementById('remainingCount').textContent = availableNumbers.length;
            
            const historyEl = document.getElementById('historyNumbers');
            const numberEl = document.createElement('div');
            numberEl.className = 'history-number';
            numberEl.textContent = number;
            // thêm số mới xuống dưới
            historyEl.appendChild(numberEl);

            // luôn scroll xuống dưới
            historyEl.scrollTop = historyEl.scrollHeight;
        }

        // Reset game
        document.getElementById('resetBtn').addEventListener('click', function() {

            if (!confirm("Bạn có chắc muốn chơi lại không?\nTất cả dữ liệu sẽ bị xóa.")) {
                return; 
            }
            document.getElementById('maxNumber').disabled = false;
            document.getElementById('setMaxBtn').disabled = false;
            document.getElementById('startBtn').style.display = 'none';
            document.getElementById('resetBtn').style.display = 'none';
            document.getElementById('currentNumber').textContent = '?';
            document.getElementById('rangeDisplay').textContent = '-';
            document.getElementById('drawnCount').textContent = '0';
            document.getElementById('remainingCount').textContent = '-';
            document.getElementById('historyNumbers').innerHTML = '';
            document.getElementById('setMaxBtn').style.display = 'inline-block';
            
            maxNumber = 0;
            availableNumbers = [];
            drawnNumbers = [];
            isSpinning = false;
            currentDisplayNumber = '?';

            // Xóa dữ liệu trong SessionStorage
            sessionStorage.removeItem('bingoGameState');
        });

        const bgMusic = document.getElementById("bgMusic");
        const toggleMusicBtn = document.getElementById("toggleMusic");

        let musicPlaying = false;

        toggleMusicBtn.addEventListener("click", () => {
            if (!musicPlaying) {
                bgMusic.play();
                toggleMusicBtn.textContent = "🔊";
            } else {
                bgMusic.pause();
                toggleMusicBtn.textContent = "🔈";
            }
            musicPlaying = !musicPlaying;
        });

        function createSnow() {
            const snow = document.createElement("div");
            snow.classList.add("snowflake");
            snow.innerHTML = "❄";

            snow.style.left = Math.random() * window.innerWidth + "px";
            snow.style.fontSize = (8 + Math.random() * 20) + "px";
            snow.style.animationDuration = (3 + Math.random() * 5) + "s";

            document.body.appendChild(snow);

            setTimeout(() => snow.remove(), 8000);
        }

        setInterval(createSnow, 150);

        const toggleBtn = document.getElementById('togglePanelBtn');
        const panelContent = document.querySelector('.panel-content');

        toggleBtn.addEventListener('click', () => {
            panelContent.classList.toggle('show');
        });


