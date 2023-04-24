import React, { useState, useRef, useEffect } from 'react'
import AvatarEditor from 'react-avatar-editor'
import AjaxLoader from "openstack-uicore-foundation/lib/components/ajaxloader";
import { create_UUID } from '../utils/uuidGenerator'
import Link from "./Link";

import styles from '../styles/profile.module.scss'


const ProfilePopupComponent = ({ userProfile, idpLoading, closePopup, showProfile, changePicture, changeProfile, fromFullProfile }) => {

  const editorRef = useRef(null);
  const modalHeaderRef = useRef(null)
  const modalRef = useRef(null)
  const fileInput = useRef(null)

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [bio, setBio] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [github, setGithub] = useState('');
  const [irc, setIRC] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');

  const [image, setImage] = useState(null);
  const [newImage, setNewImage] = useState(false);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 });
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const width = 200;
  const height = 200;

  useEffect(() => {
    setFirstName(userProfile.given_name || '');
    setLastName(userProfile.family_name || '');
    setCompany(userProfile.company || '');
    setBio(userProfile.bio || '');
    setJobTitle(userProfile.job_title || '');
    setImage(userProfile.picture || '');
    setGithub(userProfile.github_user || '');
    setIRC(userProfile.irc || '');
    setLinkedin(userProfile.linked_in_profile || '');
    setTwitter(userProfile.twitter_name || '');

    return () => {
      setFirstName('');
      setLastName('');
      setCompany('');
      setBio('');
      setJobTitle('');
      setGithub('');
      setIRC('');
      setLinkedin('');
      setTwitter('');
    };
  }, [
              userProfile.given_name,
              userProfile.family_name,
              userProfile.company,
              userProfile.picture,
              userProfile.bio,
              userProfile.job_title,
              userProfile.github,
              userProfile.irc,
              userProfile.linkedin,
              userProfile.twitter_name
  ]);

  useEffect(() => {
    if (modalHeaderRef) {
      window.setTimeout(function () {
        modalHeaderRef.current.focus();
      }, 0);
    }
  }, [modalHeaderRef])

  useEffect(() => {
    window.addEventListener('keydown', handleUserKeyPress);

    return () => {
      window.removeEventListener('keydown', handleUserKeyPress);
    };
  }, []);

  const handleUserKeyPress = (e) => {
    const focusable = modalRef.current.querySelectorAll('button, input, a, textarea, select, [tabindex]:not([tabindex="-1"])');
    const firstFocusable = focusable[0];
    const lastFocusable = focusable[focusable.length - 1];
    const KEYCODE_TAB = 9;
    const KEYCODE_ESC = 27;
    const isTabPressed = (e.key === 'Tab' || e.keyCode === KEYCODE_TAB);
    const isEscapePressed = (e.key === 'Escape' || e.keyCode === KEYCODE_ESC);

    if (isEscapePressed) {
      closePopup();
    }

    if (!isTabPressed) {
      return;
    }

    if ( e.shiftKey ) /* shift + tab */ {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else /* tab */ {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  }


  const handleNewImage = (e) => {
    setImage(e.target.files[0]);
    setNewImage(true);
  };

  const urltoFile = (url, filename, mimeType) => {
    mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
    filename = filename || create_UUID();
    return (fetch(url)
            .then(function (res) { return res.arrayBuffer(); })
            .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  };

  const handleScale = (e) => {
    const scale = parseFloat(e.target.value);
    setScale(scale);
    setNewImage(true);
  };

  const handlePositionChange = (position) => {
    setPosition(position);
    setNewImage(true);
  };

  const rotateLeft = (e) => {
    e.preventDefault();
    setRotate(rotate - 90);
    setNewImage(true);
  };

  const rotateRight = (e) => {
    e.preventDefault();
    setRotate(rotate + 90);
    setNewImage(true);
  };

  const onClickSave = () => {
    if (editorRef.current && newImage) {
      const canvas = editorRef.current?.getImage()?.toDataURL();
      if(canvas) {
        urltoFile(canvas, image.name)
            .then(file => changePicture(file));
      }
    }
    if (userProfile.given_name !== firstName ||
        userProfile.family_name !== lastName ||
        userProfile.company !== company ||
        userProfile.bio !== bio ||
        userProfile.job_title !== jobTitle ||
        userProfile.github_user !== github ||
        userProfile.irc !== irc ||
        userProfile.linked_in_profile !== linkedin ||
        userProfile.twitter_name != twitter) {
      const newProfile = {
        first_name: firstName,
        last_name: lastName,
        company: company,
        bio: bio,
        job_title: jobTitle,
        github_user: github,
        irc: irc,
        linked_in_profile: linkedin,
        twitter_name: twitter,
      };
      changeProfile(newProfile);
    }
  };

  return (
      <div className={`${styles.modal} ${showProfile ? styles.isActive : ''}`} ref={modalRef}>
        <div className={`${styles.modalCard} ${styles.profilePopup}`}>
          <AjaxLoader relative={true} color={'#ffffff'} show={idpLoading} size={120} />
          <header className={`${styles.modalCardHead}`}>
            <h2 className={`${styles.modalCardTitle}`} tabIndex='-1' ref={modalHeaderRef}>Edit profile</h2>
            <button className="link" onClick={() => closePopup()}>
              <i className={`${styles.closeIcon} fa fa-times icon`} />
            </button>
          </header>
          <section className={`${styles.modalCardBody}`}>
            <div className={styles.modalCardPicture}>
              <div className={styles.title}>Profile picture</div>
              <div className={styles.picture}>
                <AvatarEditor
                    ref={editorRef}
                    image={image}
                    width={width}
                    height={height}
                    border={50}
                    color={[0, 0, 0, 0.8]} // RGBA
                    position={position}
                    onPositionChange={handlePositionChange}
                    scale={scale}
                    borderRadius={5}
                    rotate={parseFloat(rotate)}
                />
                <div className={styles.imageUpload} tabIndex="0" onKeyPress={() => {fileInput.current.click()}}>
                    <label htmlFor="file-input" >
                      <i className={`${styles.pictureIcon} fa fa-2x fa-camera icon is-large`} />
                    </label>
                  <input ref={fileInput} name="newImage" id="file-input" type="file" accept=".jpg,.jpeg,.png" onChange={handleNewImage} />
                </div>
                <div>
                  <div className={`columns ${styles.inputRow}`}>
                  <span id="zoomLabel" className='column is-one-quarter'>Zoom:</span>
                  <div className='column is-two-thirds'>
                    <input
                      name="scale"
                      type="range"
                      aria-labelledby='zoomLabel'
                      max="2"
                      onChange={(e) => handleScale(e)}
                      step="0.01"
                      defaultValue="1"
                    />
                    </div>
                  </div>
                  <div className={`columns ${styles.inputRow}`}>
                    <div className='column is-one-quarter'>Rotate:</div>
                    <div className='column is-two-thirds'>
                      <button className={`button is-large ${styles.button}`} onClick={rotateLeft}>
                        <i className={`fa fa-undo icon is-large`} />Left
                      </button>
                      <button className={`button is-large ${styles.button}`} onClick={rotateRight}>
                        <i className={`fa fa-undo icon is-large`} />Right
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            {!fromFullProfile &&
            <div className={styles.modalCardForm}>
              <div className={styles.title}>Profile Info</div>
              <div className={styles.form}>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>First Name</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium} ${styles.readOnly}`}
                        type="text"
                        placeholder="First Name"
                        onChange={e => setFirstName(e.target.value)}
                        readOnly={true}
                        value={firstName} />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>Last Name</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium} ${styles.readOnly}`}
                        type="text"
                        placeholder="Last Name"
                        onChange={e => setLastName(e.target.value)}
                        readOnly={true}
                        value={lastName} />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>Company</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium} ${styles.readOnly}`}
                        type="text"
                        readOnly={true}
                        placeholder="Company"
                        onChange={e => setCompany(e.target.value)}
                        value={company}
                    />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>Bio</div>
                  <div className='column is-two-thirds'>
                      <textarea
                          className={`textarea ${styles.textarea}`}
                          placeholder=''
                          rows="6"
                          onChange={e => setBio(e.target.value)}
                          value={bio}
                      >
                      </textarea>
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>Job Title</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium}`}
                        type="text"
                        placeholder="Job Title"
                        onChange={e => setJobTitle(e.target.value)}
                        value={jobTitle} />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>Github</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium}`}
                        type="text"
                        placeholder="Github"
                        onChange={e => setGithub(e.target.value)}
                         value={github} />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>IRC</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium}`}
                        type="text"
                        placeholder="IRC"
                        onChange={e => setIRC(e.target.value)}
                        value={irc} />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>LinkedIn</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium}`}
                        type="text"
                        placeholder="LinkedIn"
                        onChange={e => setLinkedin(e.target.value)}
                        value={linkedin} />
                  </div>
                </div>
                <div className={`columns is-mobile ${styles.inputRow}`}>
                  <div className='column is-one-quarter'>Twitter</div>
                  <div className='column is-two-thirds'>
                    <input
                        className={`${styles.input} ${styles.isMedium}`}
                        type="text"
                        placeholder="Twitter"
                        onChange={e => setTwitter(e.target.value)}
                        value={twitter} />
                  </div>
                </div>
              </div>
            </div>
            }
          </section>
          <footer className={`${styles.modalCardFoot}`}>
            <button onClick={() => closePopup()} className="button is-large">Discard</button>
            <button onClick={() => onClickSave()} className="button is-large">Update</button>
          </footer>
        </div>
      </div>
  )
};

export default ProfilePopupComponent