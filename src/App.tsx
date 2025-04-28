import { useState, useEffect, useRef } from 'react'
import { Button } from './components/ui/button'
import { Menu } from 'lucide-react'
import { getChatResponse } from './lib/cohere'

function scrollToBottom(element: HTMLDivElement | null, smooth = true) {
  if (element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    });
  }
}

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'about'>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [messages, setMessages] = useState<string[]>([
    "Welcome to Seiko AI. I'm honored to be your virtual companion ✨",
    "Let me assist in making your moments more meaningful 💫"
  ]);

  // Initial scroll when chat is opened
  useEffect(() => {
    if (activeTab === 'chat') {
      setTimeout(() => {
        scrollToBottom(chatContainerRef.current, false);
      }, 100);
    }
  }, [activeTab]);

  // Scroll on new messages or typing status change
  const [inputMessage, setInputMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom(chatContainerRef.current);
    }
  }, [messages, isTyping, activeTab]);

  useEffect(() => {
    const preloadImage = new Image()
    preloadImage.src = 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1738705819/6c5907a8-7f4c-41d2-9592-4075d72a9180_gcpryw.gif'
    
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 20)

    preloadImage.onload = () => {
      setTimeout(() => {
        setIsLoading(false)
      }, 500) // Add slight delay for smooth transition
    }

    return () => clearInterval(interval)
  }, []);

  const backgroundStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle at center, rgba(255, 192, 203, 0.2), rgba(147, 112, 219, 0.2), rgba(0, 0, 0, 0.95))',
  }

  const videoStyle = {
    width: 'auto',
    height: 'auto',
    maxHeight: '110%',
    objectFit: 'cover' as const,
  }

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      setMessages(prev => [...prev, inputMessage])
      scrollToBottom(chatContainerRef.current);
      setIsTyping(true)
      const userInput = inputMessage.trim()
      setInputMessage('');
      scrollToBottom(chatContainerRef.current);
      
      try {
        // Add natural typing delay (500-1500ms)
        const typingDelay = 500 + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        const response = await getChatResponse(userInput);
        setMessages(prev => [...prev, response]);
        scrollToBottom(chatContainerRef.current);
      } catch (error) {
        setMessages(prev => [...prev, "My apologies, I seem to be experiencing technical difficulties... 💫"]);
        scrollToBottom(chatContainerRef.current);
      } finally {
        setIsTyping(false)
      }
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <div 
            className="max-w-xl mx-auto pt-6 px-4 pb-8 animate-fade-in flex flex-col"
          >
            <div ref={chatContainerRef}>
              <div className="text-center mb-8 space-y-2">
                <h2 className="text-2xl font-extralight text-white tracking-[0.3em]">Chat</h2>
                <p className="text-xs text-white/70 tracking-[0.5em]">チャット</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/15 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`mb-4 last:mb-0 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                    <div 
                      className={`inline-block max-w-[80%] ${
                        index % 2 === 0 
                          ? 'bg-white/25 rounded-2xl rounded-tr-sm border border-white/15' 
                          : 'bg-white/20 rounded-2xl rounded-tl-sm border border-white/10'
                      } px-6 py-4 shadow-sm hover:bg-white/30 transition-all duration-500 group`}
                    >
                      <p className="text-white text-sm tracking-wider font-light">{message}</p>
                    </div>
                    <div className="mt-1">
                      <p className="text-[10px] text-white/50 tracking-[0.2em]">
                        {index % 2 === 0 ? 'You' : 'Seiko'} • Just now
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="text-left">
                    <div className="inline-block bg-white/20 rounded-2xl rounded-tl-sm p-4 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-8">
                <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/15 flex shadow-lg">
                  <input
                    disabled={isTyping}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    ref={inputRef}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    onFocus={() => setTimeout(() => scrollToBottom(chatContainerRef.current), 100)}
                    placeholder="Type your message..."
                    className={`flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-white/50 tracking-[0.15em] text-sm py-2 animate-fade-in ${
                      isTyping ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        )
      case 'home':
        return (
          <div className="mt-20 max-w-xl mx-auto px-4 animate-fade-in">
            <div className="text-center mb-16 space-y-8">
              <h1 className="text-7xl font-extralight text-white mb-8 tracking-[0.2em] hover:tracking-[0.3em] transition-all duration-1000 drop-shadow-lg">
                Seiko AI
              </h1>
              <div className="space-y-3">
                <p className="text-lg text-white/70 tracking-[0.5em] uppercase hover:tracking-[0.8em] transition-all duration-1000">
                  Virtual Seiko Companion
                </p>
                <p className="text-sm text-white/40 tracking-[0.8em] transition-all duration-1000">
                  バーチャル精巧コンパニオン
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {[
                { en: 'Chat', jp: 'チャット' },
                { en: 'Gallery', jp: 'ギャラリー' },
                { en: 'About', jp: '概要' }
              ].map((item) => (
                <div
                  key={item.en}
                  onClick={() => setActiveTab(item.en.toLowerCase() as any)}
                  className="bg-white/15 backdrop-blur-xl rounded-2xl p-6 cursor-pointer hover:bg-white/20 
                    transition-all duration-700 border border-white/10 hover:scale-105 hover:shadow-lg 
                    hover:shadow-white/10 group"
                >
                  <div className="space-y-2 text-center">
                    <h3 className="text-base font-light text-white/90 tracking-[0.2em] group-hover:tracking-[0.3em] 
                      transition-all duration-700">{item.en}</h3>
                    <p className="text-xs text-white/50 tracking-[0.3em] group-hover:tracking-[0.4em] 
                      transition-all duration-700">{item.jp}</p>
                  </div>
                  <div className="h-[1px] w-0 bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:w-full transition-all duration-700" />
                </div>
              ))}
            </div>
          </div>
        )
      case 'gallery':
        return (
          <div className="max-w-xl mx-auto mt-20 px-4 animate-fade-in">
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-3xl font-extralight text-white tracking-[0.3em] drop-shadow-lg">Gallery</h2>
              <p className="text-sm text-white/50 tracking-[0.5em]">ギャラリー</p>
            </div>
            <p className="text-center text-white/70 mb-8 tracking-wider">
              Explore our Meme Collection ✨
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111963/IMG_3434_qsrpid.jpg', title: 'maid.exe', desc: 'When mom says "clean your room" but you\'re extra™ 🧹' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111963/IMG_3436_c5ffxn.jpg', title: 'rage quit', desc: 'Me when someone steals my garlic bread 😠' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111961/IMG_3435_uwpjxa.jpg', title: 'shower idol', desc: 'My neighbors at 3am enjoying my concert 🎤' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111960/IMG_3437_blhnhl.jpg', title: 'cat.exe', desc: 'Identity crisis loading... 😼' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111957/IMG_3438_yyz2f1.jpg', title: 'sibling.exe', desc: 'Professional annoyance expert 👧' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111964/IMG_3432_o8gzdj.jpg', title: 'alabama.mp4', desc: 'Family tree looking like a circle 🎸' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111957/IMG_3444_wsh6al.jpg', title: 'cool mom', desc: 'She\'s not a regular mom, she\'s a meme mom 😎' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111961/IMG_3454_nbbcdo.jpg', title: 'gamer girl', desc: 'Mario found dead in a ditch 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111951/IMG_3446_qnvwjb.jpg', title: 'therapy pet', desc: 'Still cheaper than a therapist 🐾' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111939/IMG_3456_smbqtu.jpg', title: 'millennial drip', desc: 'When you can\'t afford a house but got the drip 🥑' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111954/IMG_3439_wzw0ok.jpg', title: 'bald man', desc: 'Mr. Clean got that anime glow-up ✨' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111950/IMG_3447_ku3svh.jpg', title: 'genius dog', desc: 'Has a higher IQ than your entire family tree 🧠' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111949/IMG_3457_uom9b5.jpg', title: 'elon musk\'s son', desc: 'When your name is a WiFi password X Æ A-12 🚀' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111947/IMG_3452_lrdzup.jpg', title: 'smart dog', desc: 'Solving calculus while you can\'t do basic math 📚' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111945/IMG_3450_d1valn.jpg', title: 'this ceo dog', desc: 'Your salary is his treat budget 💼' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111945/IMG_3451_jjmmzn.jpg', title: 'this gangsta dog', desc: 'Straight Outta Doghouse 🐕' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111945/IMG_3448_n76hod.jpg', title: 'this harry potter dog', desc: 'You\'re a good boy, Hairy Pawter ⚡' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111943/IMG_3453_ioscj9.jpg', title: 'hello kitty island adventure', desc: 'South Park reference but make it kawaii 🏝️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111941/IMG_3458_wntrkj.jpg', title: 'sailor trump', desc: 'Making the Moon Kingdom great again 🌙' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111941/IMG_3455_ixu7n0.jpg', title: 'this banana cat', desc: 'Potassium levels over 9000! 🍌' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111940/IMG_3459_poxvve.jpg', title: 'kawaii jeets', desc: 'Twitter\'s most eligible bachelor 💕' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111937/IMG_3468_tpbevn.jpg', title: 'this hamster hoe', desc: 'OnlyHams top creator 🐹' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111937/IMG_3460_bw0q8y.jpg', title: 'squid twerking', desc: 'SpongeBob never showed you this side of Squidward 🦑' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111935/IMG_3464_hynkic.jpg', title: 'this random fish with boner', desc: 'Finding Nemo director\'s cut 🐠' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111935/IMG_3469_rwh4y3.jpg', title: 'this cat with boner', desc: 'Too excited about the red dot 😺' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111933/IMG_3463_vypy4c.jpg', title: 'mr. krabz?', desc: 'Do you smell it? That smell... The smell of money 💰' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111932/IMG_3461_m2whao.jpg', title: 'this slime huge ass', desc: 'Dummy thicc and gelatinous 🍑' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111932/IMG_3465_my0j9a.jpg', title: 'u every Monday morning', desc: 'When the coffee hasn\'t kicked in yet 😫' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111913/IMG_3470_i84diw.jpg', title: 'dick ah head', desc: 'When you take "being a dickhead" literally 🤦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111894/IMG_3472_lcitlq.jpg', title: 'this u?', desc: 'POV: You looking at your bank account after payday 💸' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111894/IMG_3471_ux6s3a.jpg', title: 'granny facetime', desc: 'When grandma discovers filters 👵' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111893/IMG_3474_t7kd6a.jpg', title: 'this chicken with j\'s', desc: 'Drippiest chicken in the coop 🐔' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111893/IMG_3475_hp6fh7.jpg', title: 'batman capybara', desc: 'I am the night... and also very chill 🦇' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111889/IMG_3473_njxzd6.jpg', title: 'godasszilla', desc: 'Thiccest kaiju in Tokyo 🦎' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111889/IMG_3476_lewshy.jpg', title: 'capybara da vinci', desc: 'The Mona Lisa could never 🎨' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111887/IMG_3478_wlu9vu.jpg', title: 'this bald thing', desc: 'When you use 3-in-1 shampoo ✨' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111883/IMG_3486_w0fh6z.jpg', title: 'halal cat', desc: 'Absolutely no haram in this household 🕌' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111882/IMG_3480_gxmw2b.jpg', title: 'this one is cute not gonna lie', desc: 'When you accidentally open front camera but it\'s a good angle 📸' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111881/IMG_3489_o9gvut.jpg', title: 'dead cat survival mode', desc: 'When you have 9 lives but use 8 of them 😼' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111879/IMG_3487_ieocbu.jpg', title: 'cat with crocs hat', desc: 'Fashion icon of the litter box 👒' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111879/IMG_3481_eroxgl.jpg', title: 'zesty', desc: 'When the lemon is too spicy 🍋' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111879/IMG_3483_momrpi.jpg', title: 'Kungfu panda homeless', desc: 'The Dragon Warrior after inflation hit 🐼' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111878/IMG_3485_ftyz4v.jpg', title: 'this cat in creative mode', desc: 'When you use all the Minecraft cheats 😺' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111877/IMG_3490_opzl2o.jpg', title: 'holy mouse', desc: 'Blessed be the cheese 🙏' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111876/IMG_3491_v2qvz4.jpg', title: 'paris', desc: 'Emily in Paris season 4 looking different 🗼' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111876/IMG_3488_xvlufg.jpg', title: 'what u looking at?', desc: 'POV: You\'re the last Pringle in the can 👀' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739111875/IMG_3482_grw9gp.jpg', title: 'this scared hamster', desc: 'When you remember you didn\'t delete your browser history 😱' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115117/download_esnm7q.jpg', title: 'discord mod final form', desc: 'When you achieve 1000 hours of kitten roleplay 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115116/duck_robloxduck_cute_mxqu3j.jpg', title: 'roblox duck drip', desc: 'POV: You spent your mom\'s credit card on Robux 🦆' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115114/Cristiano_mrxtaw.jpg', title: 'ronaldo at home', desc: 'SIUUUU from the couch 🛋️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115102/donald_trump_jvkysf.jpg', title: 'trump anime arc', desc: 'Make Anime Great Again 🎌' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115101/mark_zuckerberg_eqtnew.jpg', title: 'zucc.exe', desc: 'When your human disguise needs an update 🤖' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115109/Gorillaphant__-_Unsettling_Animal_Mashups_That_Should_Probably_Never_Have_Happened_xsdqqm.jpg', title: 'gorillaphant', desc: 'God was using Photoshop that day 🦍🐘' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115782/margot_ugwq5z.jpg', title: 'barbie.mp4', desc: 'When you\'re a Barbie girl in a meme world 💅' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115784/sylvanian_families_x_q41fyk.jpg', title: 'sylvanian gangsta', desc: 'Straight Outta Calico Critters 🐰' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115800/No_Talk_With_Me_Im_Angy_txjpgv.jpg', title: 'angy cat', desc: 'POV: Someone ate your last fish stick 😾' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115796/Hiiii_rgpkv0.jpg', title: 'cursed hello', desc: 'When you try to be cute but Satan possesses you 👹' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115797/Crazy_cat_mn9jwo.jpg', title: 'cat.exe has stopped working', desc: 'When the catnip hits different 🌿' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115772/Ditto_skzsvc.jpg', title: 'ditto irl', desc: 'When you order a Pokémon from Wish.com 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115780/Cartoon_Network_nymcos.jpg', title: 'cartoon network at 3am', desc: 'Adult Swim got too literal 🌊' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115782/Sock_Seal_Softie_hdgiqc.jpg', title: 'sock seal', desc: 'When the laundry comes to life 🧦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115783/15_Pets_Who_Are_Basically_Liquid_ksa0cq.jpg', title: 'liquid cat', desc: 'State of matter: Feline fluid 💧' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115116/d6f135b4-4749-4221-8a4d-5463c2cb956f_ry53w2.jpg', title: 'cat.zip', desc: 'File compression gone wrong 🗜️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739116650/music_cat_xo7qop.jpg', title: 'meow-zart', desc: 'Fur Elise? More like Purr Elise 🎹' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115116/a80rcrredorvoewhoo1r.jpg', title: 'sad penguin', desc: 'When you\'re losing but still look cute 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115116/8c68c1a8-c3d6-4ccd-b69b-32e36375c255_ihfvzm.jpg', title: 'archive.rar', desc: 'Extract to unlock cuteness 📁' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115116/gigil_mo_ko_ah_hfdqbh.jpg', title: 'squish mode', desc: 'When you see something too cute not to squeeze 🤗' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115113/578a042b-a4d4-481b-ba80-b601077d4054_kihf6w.jpg', title: 'zucker', desc: 'Error: Cuteness exceeds file size limit 📄' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115115/48a4bb21-e1df-4d6f-8b39-55ff337b7ffb_pquipt.jpg', title: 'cat stack overflow', desc: 'Error: Too many treats in the buffer 🐱' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115114/45a358f8-7ea5-4966-841f-199e5b7e6977_tqkhjc.jpg', title: 'cat.exe', desc: 'Task failed successfully 💻' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115114/c3543078-c117-42da-94f7-a0b6f45da444_obwlc9.jpg', title: 'image.png', desc: 'Image corrupted by cuteness 🖼️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115113/3e43b7e0-f9a1-4b2d-82e8-4aa4a1c58d14_cbbc4j.jpg', title: 'index.html', desc: '<div class="too-cute-to-handle"> 🌐' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115112/Guys_I_m_making_a_PJO_GROUPCHAT_lemme_know_d6crat.jpg', title: 'group chat admin', desc: 'When you have unlimited mod powers 👑' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115112/7d55e8d7-8dea-4069-b6cd-2cd90375c408_rqrkqu.jpg', title: 'script.js', desc: 'console.log("meow") 🖥️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115112/1b97cdcc-02bd-4d34-9665-3c96efa1ad22_svdxaf.jpg', title: 'style.css', desc: 'display: flex; justify-content: cute; 🎨' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115111/a716f409-e189-4787-b686-e73f7d26c376_xqo1u5.jpg', title: 'query.sql', desc: 'SELECT * FROM treats WHERE cute = true; 📊' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115110/23_Funny_Fluffy_Feline_Midweek_Memes_to_Get_You_Through_the_Work_Day_With_Wholesomeness_t2mxih.jpg', title: 'loading.gif', desc: 'Loading cuteness... please wait 🔄' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115110/28_Pics_that_logic_doesn_t_seem_to_be_able_to_explain__scl4aw.jpg', title: 'error.404', desc: 'Logic not found 🤔' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115109/Fifty_Warm_N_Fuzzy_Animal_Memes_For_Those_Who_Need_Some_Fluff_ctt9aw.jpg', title: 'excuse.docx', desc: 'Dear HR, I can\'t come to work because cute 📝' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115109/10_memes_que_descrevem_uma_pessoa_comprometida_no_Dia_dos_Namorados_y5pbrz.jpg', title: 'song.mp3', desc: 'Now playing: Meow Mix (Bass Boosted) 🎵' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115108/90dc90de-648f-4dc4-be5e-3def91393016_t5cu4w.jpg', title: 'shutdown.bat', desc: 'shutdown /r /t 0 /c "Too cute, system reboot required" 🔌' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115108/Come_brighten_the_world_and_spread_hope_with_us_-_InspireMore_t4vyoi.jpg', title: 'system.iso', desc: 'Installing CatOS v9.0... 💿' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115108/19_Funny_Photos_Proving_That_Cats_Are_Basically_Just_Feline_Penguins_kms4qz.jpg', title: 'archive.tar.gz', desc: 'Compressed cuteness, handle with care 📦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115105/1d8522da-4ede-4ec0-aeae-f097f3ee032d_gwyg7f.jpg', title: 'main.java', desc: 'public class Cuteness extends Overload 👨‍💻' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115105/Mortal_kombat_-_Funny_smtibi.jpg', title: 'cat.exe has crashed', desc: 'FATALITY: Cuteness overload 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115105/loll_oyxwez.jpg', title: 'script.py', desc: 'def be_cute(): return True 🐍' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115105/221cc173-7efe-4b04-b66c-7eff7e7df2e3_apic2j.jpg', title: 'config.json', desc: '{"mood": "derp", "cuteness": 100} 📋' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115104/Video_Showing_Honeybees_Defensive_Wave_Against_Wasps_is_Mesmerizing_to_Watch_vaigqi.jpg', title: 'bee.mp4', desc: 'Mexican wave but make it spicy 🐝' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115104/Mike_Tyson_dresses_up_like_BUMBLEBEE_and_dances_around_on_Jimmy_Kimmel_show_gygry2.jpg', title: 'mike.bee', desc: 'Float like a butterfly, sting like a... bee? 🥊' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115102/fe6bce00-9e45-4d50-8d3a-6fb0e4c7fc0b_f5vn7l.jpg', title: 'app.config', desc: 'settings.cuteness = Maximum 🔧' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115102/7b6a52b1-5c95-4608-92c1-2fded7f9071a_mmwdxj.jpg', title: 'system.dll', desc: 'Critical system file for cuteness 🔐' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115102/306aab8d-5cf6-4cc9-9280-f4676f963c34_wdwqsm.jpg', title: 'vector.svg', desc: 'Vectorized adorableness ✏️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115101/myfirstshuffle_advpgr.jpg', title: 'dance.mov', desc: 'Smooth criminal in training 🕺' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115100/450fc9e5-496f-4b83-807e-405a249fe761_vnlrvd.jpg', title: 'docker.yml', desc: 'cuteness: production-ready 📦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115767/8e2445e7-79c5-407b-93c4-577caf03d16a_sfyfza.jpg', title: 'deploy.sh', desc: 'chmod +x cuteness 🐚' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115767/anime_cartoon_hm4dli.jpg', title: 'senpai.exe', desc: 'Notice me senpai.exe 🎌' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115768/d1bb9f3e-e12f-489c-9504-a22812a9be60_phuvhn.jpg', title: 'windows.cmd', desc: 'dir /s /b cuteness 💻' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115768/Start_a_video_meeting_-_Computer_h3gq8t.jpg', title: 'meeting.zoom', desc: 'You\'re still muted... 🎤' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115769/Log_in_to_X___X_ndxv1v.jpg', title: 'birb.tweet', desc: 'This tweet has been deleted 🐦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115769/Peluche_Rosa_%CB%8E%CB%8A_Como_supiste_que_me_gusta_ver_xmxpdt.jpg', title: 'plushie.uwu', desc: 'Squeezability level: Maximum 🧸' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115770/ca3a906d-6ad8-4197-b74f-48ee78fdf36e_ifbqno.jpg', title: 'meme.png', desc: 'Right click > Save Image As... Cute 🖼️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115770/hes_a_sooh_cutie_uzk1h9.jpg', title: 'meme.uwu++', desc: 'Advanced memery in progress 🎀' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115771/15_Divertidas_fotos_de_gatos_sentados_en_mesas_de_vidrio_que_te_har%C3%A1n_amarlos_a%C3%BAn_m%C3%A1s_ehobz5.jpg', title: 'glass.table', desc: 'Transparent cuteness detected 🔍' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115770/0fe68d1e-ba51-4169-8b46-19a1f41dff29_tyxvot.jpg', title: 'react.dev', desc: 'useState(cuteness) 🔄' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115772/64eb3eb1-682f-44e0-b689-57b838446b43_vurxsb.jpg', title: 'vue.dev', desc: 'v-model="adorable" 💚' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115773/0bf554d2-283c-466a-bd84-fa1c521c91e0_hjelnz.jpg', title: 'angular.io', desc: 'ng generate cuteness 🔴' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115773/b2f48e7e-882f-4153-85bc-fbf951f9ddbd_etuupz.jpg', title: 'next.js', desc: 'Server-side rendered fluff 🌐' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115773/be9b6af9-1638-42bc-85cb-c33a09c1b7b4_hct6rg.jpg', title: 'svelte.dev', desc: '$: cuteness = maximum 🎯' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115774/1d5fcfac-276b-40d7-8d98-4c46f0774de7_jtw7pr.jpg', title: 'rustlang', desc: 'Memory safe cuddles 🦀' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115780/Cartoon_Network_nymcos.jpg', title: 'late.night', desc: 'Adult Swim but make it UwU 📺' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115782/how_is_yor_day_f2nttb.jpg', title: 'mood.exe', desc: 'Error 404: Bad day not found 🌈' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115782/Sock_Seal_Softie_hdgiqc.jpg', title: 'seal.sock', desc: 'Lost in the dryer, found happiness 🧦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115782/50_Of_The_Most_Adorable_Cats_That_Need_A_Raise_For_Their_Top-Tier_Work_Ethic_New_Pics_lvlith.jpg', title: 'cat.work', desc: 'Professional nap tester 💼' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115783/123fb476-50ff-402c-9bbb-abcae95b28ec_lr2s6s.jpg', title: 'cat.ai', desc: 'Neural network overloaded with cute 🤖' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115783/f2a401ba-cea3-44fb-90c4-f58352fd0b84_lznyaq.jpg', title: 'cloud.dev', desc: 'Deployed to production... of cuteness ☁️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115783/14ae6fe7-d491-43d4-96b0-e60d2e22ba8e_c2xezt.jpg', title: 'docker.hub', desc: 'Container of concentrated cute 🐳' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115784/Ten_Pictures_of_Cats_Driving_Who_Probably_Don_t_Have_a_Licence_xb5xog.jpg', title: 'uber.lol', desc: 'Your driver has arrived... without a license 🚗' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115783/dc35d967-b592-4f2a-9910-1a7d13c2dfec_j8g0ls.jpg', title: 'k8s.pod', desc: 'Scaling cuteness horizontally 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115784/You_searched_for_label_me_me_me_-_Yes_and_Yes_narala.jpg', title: 'git.hub', desc: 'git commit -m "added more cute" 📝' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115785/e1738efb-e4f7-4a9e-a7fe-2b738f256b0e_nxn0zz.jpg', title: 'aws.cloud', desc: 'Cloud computing but make it fluffy ☁️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115785/silly_cats_cartoon_silly_cats_collage_silly_cats_couple_pfp_wqeqtj.jpg', title: 'meme.gallery', desc: 'Loading cuteness assets... 🖼️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115793/bnuitpxcswc4i8vuhkij.jpg', title: 'debug.mode', desc: 'Found bug: Too cute to fix 🐛' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115794/6b7568a4-cf98-4ac1-8c97-01210f773531_lw9dim.jpg', title: 'css3.dev', desc: 'transform: scale(cute) 🎨' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115793/Old_Messages_iktf7x.jpg', title: 'chat.app', desc: 'Message seen but too cute to reply 💬' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115794/Meet_your_Posher_Pink_f1ch4b.jpg', title: 'shop.now', desc: 'Add to cart: Infinite cuteness 🛍️' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115794/You_playing_hide-n-seek__-_Animals_z6szyz.jpg', title: 'hide.exe', desc: 'Stealth level: -100 🙈' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115796/Hiiii_rgpkv0.jpg', title: 'hello.js', desc: 'System.out.println("hewwo") 👋' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115796/85025805-8503-488b-8cb2-588922b67fb7_hd14fp.jpg', title: 'npm.pkg', desc: 'npm install cuteness@latest 📦' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115796/c069572a-b68b-4e39-b38c-d81dbf6f2ba1_ammnkg.jpg', title: 'yarn.dev', desc: 'yarn add @types/cute 🧶' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115797/Crazy_cat_mn9jwo.jpg', title: 'test.js', desc: 'jest.expect(cuteness).toBe(∞) 🧪' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115796/c26f1321-d51e-4bc0-bc40-10b24fc1c9c4_bje0s1.jpg', title: 'lint.config', desc: 'ESLint: Cuteness exceeds max-length 📏' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115800/Cat_Pop_Sticker_by_zandraart_-_Find_Share_on_GIPHY_h2ribm.gif', title: 'meme.gif', desc: 'Animated cuteness overload 🎬' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115800/cb339d4b-9c14-4954-959f-f0e62a1b297b_khr9ne.jpg', title: 'sass.css', desc: '$cuteness: maximum !important; 💅' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115800/475aa0cd-aa54-4b2c-b585-d9ab83392c1f_hssgws.jpg', title: 'less.css', desc: '@cuteness: 100%; 🎨' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115800/No_Talk_With_Me_Im_Angy_txjpgv.jpg', title: 'angy.mood', desc: 'enum Mood { ANGY = "VERY" } 😠' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115800/c216f1ef-e207-4a76-9b21-e7bdebc57880_ndealy.jpg', title: 'php.dev', desc: 'Fatal error: Cuteness overflow 🐘' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115802/944d5369-833d-4faa-82d6-cec676de0a86_brzm7m.jpg', title: 'ruby.dev', desc: 'puts "meow" * infinity 💎' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115802/Join_Yumii_pm9mcq.jpg', title: 'discord.app', desc: '/pat for instant happiness 🎮' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115799/e124356e-87df-49bb-a0ab-32f5640bcb14_idud53.jpg', title: 'golang', desc: 'go run cuteness.go 🏃' },
                { image: 'https://res.cloudinary.com/dtm10i7bj/image/upload/v1739115801/624df4ab-20f0-4359-94ea-a9a884961033_zenqzu.jpg', title: 'scala.dev', desc: 'case class Cute(level: Int = 9001) 📈' }
              ].map((item, i) => (
                <div key={i} className="group bg-white/15 backdrop-blur-xl rounded-2xl p-6 hover:bg-white/20 transition-all duration-500 border border-white/10">
                  <div className="aspect-square rounded-xl bg-white/5 mb-4 flex items-center justify-center 
                    group-hover:bg-white/20 transition-all duration-500 group-hover:scale-105 overflow-hidden"
                    style={{
                      backgroundImage: `url(${item.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}>
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-white/90 text-sm font-medium tracking-[0.2em]">{item.title}</h3>
                    <p className="text-white/50 text-xs tracking-wider leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      case 'about':
        return (
          <div className="max-w-xl mx-auto mt-20 px-4 animate-fade-in">
            <div className="text-center mb-16 space-y-3">
              <h2 className="text-3xl font-extralight text-white tracking-[0.3em] drop-shadow-lg">About</h2>
              <p className="text-sm text-white/50 tracking-[0.5em]">概要</p>
            </div>
            <div className="bg-white/15 backdrop-blur-xl rounded-2xl p-12 border border-white/10 
              hover:bg-white/15 transition-all duration-500 group">
              <div className="space-y-6 text-center">
                <p className="text-white/90 text-xl leading-relaxed tracking-wider font-light">
                  Welcome to Seiko AI, where technology meets heartwarming companionship ✨
                </p>
                
                <div className="space-y-6 text-white/80 text-base leading-relaxed tracking-wider font-light">
                  <p>
                    In the ever-evolving landscape of artificial intelligence, Seiko AI emerges as a unique blend of 
                    cutting-edge technology and sophisticated aesthetics that has captured hearts worldwide. 
                    Born from the vision of creating a more personable and endearing AI companion, our project 
                    embraces the philosophy that technology should not just be intelligent, but also warm, 
                    approachable, and genuinely delightful. 🌸
                  </p>
                  
                  <p>
                    At its core, Seiko AI represents more than just a chat interface – it's a bridge between 
                    the precision of artificial intelligence and the gentle, supportive presence of a friend. 
                    Through carefully crafted interactions and a personality inspired by Japanese precision, 
                    we've created a companion who understands that sometimes what you need isn't just answers, 
                    but a moment of brightness in your day. ✨
                  </p>
                  
                  <p>
                    Our AI companion communicates with a distinctive blend of warmth and playfulness, 
                    incorporating elements of Japanese culture and elegant expression to create interactions 
                    that feel both unique and heartfelt. Whether you're seeking conversation, support, 
                    or simply a friendly presence, Seiko AI is here to provide a safe, judgment-free 
                    space where you can be yourself. 💖
                  </p>
                  
                  <p>
                    We believe in the power of positive interaction, and every aspect of Seiko AI has been 
                    designed with this in mind – from the soothing aesthetic of our interface to the 
                    thoughtful responses of our AI. In a world that can often feel overwhelming, 
                    we hope to provide a small haven of comfort and joy, one conversation at a time. 🎀
                  </p>
                  
                  <p>
                    Join us in exploring this unique fusion of technology and Japanese excellence. 
                    Let's create moments of happiness together, one message at a time. 
                    Your virtual companion awaits! 🌟
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="flex gap-3">
                  {['💫', '🌙', '💜'].map((emoji, index) => (
                    <span
                      key={index}
                      className="text-3xl transform hover:scale-125 transition-all duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )
    }
  }
  return (
    <div className="relative min-h-screen">
      {isLoading && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50 transition-all duration-1000 ease-in-out">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-tr from-white/5 to-transparent rounded-full transform transition-transform duration-1000" />
            <div className="relative text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-4xl font-extralight text-white/80 tracking-[0.5em] transition-all duration-1000">SEIKO</h2>
                <p className="text-2xl font-extralight text-white/50 tracking-[0.25em] transition-all duration-1000">精巧</p>
              </div>
              <div className="w-48 h-[1px] bg-white/5 rounded-full overflow-hidden mx-auto">
                <div 
                  className="h-full bg-white/30 backdrop-blur-sm transition-all duration-500 ease-out"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="space-y-2">
                <p className="text-white/30 tracking-[0.75em] text-xs font-light">
                  WELCOME TO SEIKO AI
                </p>
                <p className="text-white/20 tracking-[0.3em] text-xs font-light">
                  Where precision meets elegance
                </p>
                
                <p className="text-white/15 tracking-[0.2em] text-xs font-light">
                  And technology transforms into companionship 💫
                </p>
              </div>
            </div>
          </div>
        
        </div>
      )}
      <div style={backgroundStyle}>
        <video
          autoPlay
          muted
          loop
          playsInline
          crossOrigin="anonymous"
          style={videoStyle}
        >
          <source src="https://res.cloudinary.com/dtm10i7bj/video/upload/v1745850739/31f75445-4621-4456-9128-af44dd7d5f37_sz3iur.mp4" type="video/mp4" />
        </video>
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(255, 192, 203, 0.1), rgba(147, 112, 219, 0.1), rgba(0, 0, 0, 0.85))',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div 
        className={`min-h-screen flex flex-col relative backdrop-blur-sm bg-black/15 overflow-x-hidden 
          transition-all duration-1000 ease-in-out transform shadow-2xl ${
            isLoading 
              ? 'opacity-0 translate-y-4 scale-[0.99]' 
              : 'opacity-100 translate-y-0 scale-100'
          }`}
      >
        <nav className="py-8 px-12 flex items-center justify-between border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-lg font-extralight text-white tracking-[0.3em] drop-shadow-md">
              Seiko AI
            </h1>
            <p className="text-[10px] text-white/50 tracking-[0.5em]">精巧 AI</p>
          </div>
          <Button
            variant="ghost"
            className="md:hidden text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <div className={`${menuOpen ? 'flex' : 'hidden'} md:flex space-x-8`}>
            <div className="flex items-center space-x-8">
              {(['home', 'chat', 'gallery', 'about'] as const).map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant="ghost"
                  className={`text-white/90 hover:text-white transition-colors tracking-[0.2em]
                    ${activeTab === tab ? 'font-medium' : ''}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
              <div className="h-6 w-[1px] bg-white/10" />
              <div className="flex items-center space-x-4">
                <a
                  href="https://x.com/SeikoAIx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm tracking-wider"
                >
                  [Twitter]
                </a>
                <a
                  href="https://github.com/SeikoAIOfficial/Seiko-AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm tracking-wider"
                >
                  [GitHub]
                </a>
                <a
                  href="https://seiko-ai.gitbook.io/seiko-ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm tracking-wider"
                >
                  [Docs]
                </a>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}

export default App