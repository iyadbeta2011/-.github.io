// DOM Elements
const storiesContainer = document.getElementById('stories-container');
const addStoryBtn = document.getElementById('add-story-btn');
const addStoryModal = document.getElementById('add-story-modal');
const closeBtn = document.querySelector('.close-btn');
const storyForm = document.getElementById('story-form');
const storyText = document.getElementById('story-text');
const charCount = document.getElementById('char-count');
const textContentGroup = document.getElementById('text-content-group');
const audioContentGroup = document.getElementById('audio-content-group');
const videoContentGroup = document.getElementById('video-content-group');
const recordBtn = document.getElementById('record-btn');
const stopBtn = document.getElementById('stop-btn');
const audioPreview = document.getElementById('audio-preview');
const videoUpload = document.getElementById('video-upload');
const videoPreview = document.getElementById('video-preview');
const filterLinks = document.querySelectorAll('nav a[data-filter]');

// افترض أن لدينا مستخدم مسجل دخوله حالياً
const currentUser = 'user123'; // يمكن استبدالها بقيمة من نظام تسجيل الدخول

// تهيئة البيانات من localStorage أو استخدام البيانات الافتراضية
let stories = JSON.parse(localStorage.getItem('stories')) || [
    {
        id: 1,
        title: "القطة الجائعة",
        content: "في ليلة باردة، وجدت قطة جائعة على بابي. أطعمتها واعتقدت أنها سترحل، لكنها أصبحت سيدة المنزل وأنا خادمها المخلص.",
        type: "text",
        category: "funny",
        likes: 24,
        likedBy: ['user123', 'user456'],
        date: "2023-05-15",
        author: 'user123'
    },
    {
        id: 2,
        title: "الوداع الأخير",
        content: "وقف أمام قبر والده يحمل رسالة لم يرسلها أبداً. الآن يعرف أن بعض الكلمات يجب أن تقال قبل فوات الأوان.",
        type: "text",
        category: "sad",
        likes: 42,
        likedBy: ['user456'],
        date: "2023-06-02",
        author: 'user456'
    }
];

let mediaRecorder;
let audioChunks = [];
let currentFilter = 'all';

// حفظ القصص في localStorage
function saveStoriesToLocalStorage() {
    localStorage.setItem('stories', JSON.stringify(stories));
}

// عرض القصص
function displayStories() {
    storiesContainer.innerHTML = '';

    const filteredStories = stories.filter(story => {
        if (currentFilter === 'all') return true;
        return story.type === currentFilter;
    });

    filteredStories.forEach(story => {
        const storyCard = document.createElement('div');
        storyCard.className = `story-card ${story.category}`;
        storyCard.dataset.id = story.id;

        let mediaContent = '';
        if (story.type === 'audio') {
            mediaContent = `
                <audio controls class="story-audio">
                    <source src="${story.audioUrl}" type="audio/mpeg">
                    متصفحك لا يدعم تشغيل الصوت.
                </audio>
            `;
        } else if (story.type === 'video') {
            mediaContent = `
                <video controls class="story-media">
                    <source src="${story.videoUrl}" type="video/mp4">
                    متصفحك لا يدعم تشغيل الفيديو.
                </video>
            `;
        }

        const isLiked = story.likedBy.includes(currentUser);
        const isAuthor = story.author === currentUser;

        storyCard.innerHTML = `
            ${story.type !== 'text' ? mediaContent : ''}
            <div class="story-content">
                ${story.title ? `<h3 class="story-title">${story.title}</h3>` : ''}
                ${story.type === 'text' ? `<p class="story-text">${story.content}</p>` : ''}
                <div class="story-meta">
                    <span class="story-type ${'type-' + story.type}">
                        ${story.type === 'text' ? 'نص' : story.type === 'audio' ? 'صوت' : 'فيديو'}
                    </span>
                    <span class="story-category">${getCategoryName(story.category)}</span>
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-id="${story.id}">
                        <i class="fas fa-heart"></i> ${story.likes}
                    </button>
                    <span>${story.date}</span>
                    ${isAuthor ? `<button class="delete-btn" data-id="${story.id}"><i class="fas fa-trash"></i></button>` : ''}
                </div>
            </div>
        `;
        storiesContainer.appendChild(storyCard);
    });

    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', handleLike);
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

// الحصول على اسم التصنيف
function getCategoryName(category) {
    const categories = {
        funny: 'مضحكة',
        sad: 'حزينة',
        scary: 'مرعبة',
        romantic: 'رومانسية',
        weird: 'غريبة',
        inspirational: 'ملهمة'
    };
    return categories[category];
}

// معالجة الإعجاب
function handleLike(e) {
    const storyId = parseInt(e.target.dataset.id);
    const story = stories.find(s => s.id === storyId);
    
    if (!story) return;

    const userIndex = story.likedBy.indexOf(currentUser);

    if (userIndex === -1) {
        story.likes++;
        story.likedBy.push(currentUser);
    } else {
        story.likes--;
        story.likedBy.splice(userIndex, 1);
    }

    saveStoriesToLocalStorage();
    displayStories();
}

// معالجة الحذف
function handleDelete(e) {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذه القصة؟')) return;
    
    const storyId = parseInt(e.target.dataset.id);
    const storyIndex = stories.findIndex(s => s.id === storyId);
    
    if (storyIndex !== -1 && stories[storyIndex].author === currentUser) {
        stories.splice(storyIndex, 1);
        saveStoriesToLocalStorage();
        displayStories();
    }
}

// فتح وإغلاق المودال
addStoryBtn.addEventListener('click', () => {
    addStoryModal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
    addStoryModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === addStoryModal) {
        addStoryModal.style.display = 'none';
    }
});

// تغيير نوع المحتوى
document.querySelectorAll('input[name="story-type"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        textContentGroup.classList.add('hidden');
        audioContentGroup.classList.add('hidden');
        videoContentGroup.classList.add('hidden');

        if (e.target.value === 'text') textContentGroup.classList.remove('hidden');
        if (e.target.value === 'audio') audioContentGroup.classList.remove('hidden');
        if (e.target.value === 'video') videoContentGroup.classList.remove('hidden');
    });
});

// عداد الأحرف (حتى 1800)
storyText.addEventListener('input', () => {
    const maxChars = 1800;
    const count = storyText.value.length;
    charCount.textContent = count;
    charCount.style.color = count > maxChars ? 'red' : 'black';
});

// تسجيل الصوت (حتى 15 دقيقة)
recordBtn.addEventListener('click', async function() {
    audioChunks = [];
    recordBtn.disabled = true;
    stopBtn.disabled = false;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.addEventListener('dataavailable', event => {
            audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener('stop', () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            const audioUrl = URL.createObjectURL(audioBlob);
            audioPreview.src = audioUrl;
            audioPreview.classList.remove("hidden");
        });

        mediaRecorder.start();

        setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                alert("تم الوصول إلى الحد الأقصى للتسجيل (15 دقيقة).");
            }
        }, 15 * 60 * 1000);

    } catch (err) {
        alert('لا يمكن الوصول إلى الميكروفون.');
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }
});

stopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        recordBtn.disabled = false;
        stopBtn.disabled = true;
    }
});

// رفع ومعاينة الفيديو (حتى 15 ثانية)
videoUpload.addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const videoUrl = URL.createObjectURL(file);
        videoPreview.src = videoUrl;
        videoPreview.classList.remove("hidden");

        videoPreview.onloadedmetadata = () => {
            if (videoPreview.duration > 15) {
                alert("مدة الفيديو يجب أن تكون 15 ثانية أو أقل");
                videoUpload.value = '';
                videoPreview.src = '';
                videoPreview.classList.add('hidden');
            }
        };
    }
});

// إضافة قصة جديدة
storyForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('story-title').value;
    const type = document.querySelector('input[name="story-type"]:checked').value;
    const category = document.getElementById('story-category').value;

    const newStory = {
        id: stories.length > 0 ? Math.max(...stories.map(s => s.id)) + 1 : 1,
        title: title || undefined,
        type,
        category,
        likes: 0,
        likedBy: [],
        date: new Date().toISOString().split('T')[0],
        author: currentUser
    };

    if (type === 'text') {
        const content = storyText.value;
        if (content.length > 1800) {
            alert('النص يجب أن يكون 1800 حرف أو أقل');
            return;
        }
        newStory.content = content;
    } else if (type === 'audio') {
        if (!audioPreview.src) {
            alert('يجب تسجيل مقطع صوتي أولاً');
            return;
        }
        newStory.audioUrl = audioPreview.src;
    } else if (type === 'video') {
        if (!videoPreview.src) {
            alert('يجب اختيار ملف فيديو أولاً');
            return;
        }
        newStory.videoUrl = videoPreview.src;
    }

    stories.unshift(newStory);
    saveStoriesToLocalStorage();
    displayStories();
    addStoryModal.style.display = 'none';
    storyForm.reset();
    audioPreview.src = '';
    videoPreview.src = '';
    audioPreview.classList.add('hidden');
    videoPreview.classList.add('hidden');
    charCount.textContent = '0';
});

// التصفية حسب النوع
filterLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        currentFilter = link.dataset.filter;

        filterLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        displayStories();
    });
});

// بدء التشغيل
displayStories();