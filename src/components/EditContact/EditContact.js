import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ContactService from '../../services/contactService';
import { toast } from 'react-toastify';
import Spinner from '../Spinner/Spinner';
import noAvatar from '../../asset/images/noAvatar.png';
import GroupService from '../../services/groupService';
import FileService from '../../services/FileService';

function EditContact() {



    const [state, setState] = useState({
        loading: false,
        contact: {
            name: '',
            photoUrl: '',
            mobile: '',
            email: '',
            company: '',
            title: '',
            groupId: 0
        },
        groups: [],
        errorMessage: ''
    })

    const [select, setSelect] = useState({
        uploading: false,
        file: ''
    })

    // const [contact, setContact] = useState({
    //     name: '',
    //     photoUrl: '',
    //     mobile: '',
    //     email: '',
    //     company: '',
    //     title: '',
    //     groupId: 0
    // })

    const { contactId } = useParams();


    useEffect(
        () => {
            try {
                setState({ ...state, loading: true })
                async function getData() {
                    let contactRes = await ContactService.getContact(contactId);
                    let groupRes = await GroupService.getGroups();
                    // console.log(contactId);
                    setState({
                        ...state,
                        // contact:{
                        //     ...contact,
                        //     name: contactRes.data.name,
                        //     photoUrl: contactRes.data.photoUrl,
                        //     mobile: contactRes.data.mobile,
                        //     email: contactRes.data.email,
                        //     company: contactRes.data.company,
                        //     title: contactRes.data.title,
                        //     groupId: contactRes.data.groupId
                        // },
                        contact: contactRes.data,
                        groups: groupRes.data,
                        loading: false
                    })
                }
                getData();
            } catch (error) {
                setState({ ...state, loading: false, errorMessage: error.message })
            }
            return () => {

                console.log(contact);
                if (contact.photoUrl) {
                    async function clearAvatar() {
                        await FileService.destroy(contact.photoUrl)
                    }
                    clearAvatar();
                }
            }
        }, []
    )

    const handleInputValue = (e) => {
        setState({
            ...state,
            contact: {
                ...contact,
                [e.target.name]: e.target.value
            }
        })

    }


    const changeAvatar = (e) => {
        let select_file = e.target.files[0];
        let fakeAvatarUrl = URL.createObjectURL(select_file);
        contact.photoUrl = fakeAvatarUrl
        setSelect({
            ...select,
            file: select_file
        })

    }

    const handleUpload = () => {
        if (select.file) {
            setSelect({ ...select, uploading: true });
            async function uploadAvatar() {
                let uploadResult = await FileService.upload(select.file);
                contact.photoUrl = uploadResult.data.url;
                setSelect({
                    ...select,
                    uploading: false
                })
                toast.success("Avatar uploaded successfully.");
            }
            uploadAvatar();

        } else {
            toast.info("Please select an avatar");
        }

    }


    const handleSubmit = async function (e) {
        e.preventDefault();
        try {
            setState({ ...state, loading: true });

            let result = await ContactService.editContact(contact, contactId)
            setState({ ...state, loading: false });
            if (result.data) {
                toast.success("Edited successfully.");
            }
        
        } catch (error) {
        setState({
            ...state,
            loading: false,
            errorMessage: error.message
        })
        toast.error(error.message);
    }
}



const { loading, groups, errorMessage, contact } = state;

return (
    <>
        <section className='edit-contact-info'>
            <div className="container">
                <h3 className="fw-bolder text-success">Edit Contact</h3>
            </div>
        </section>
        <section className='edit-contact'>
            {
                loading ? <Spinner /> : (
                    <div className='container'>
                        <div className='row'>
                            <div className='col-4'>
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-2">
                                        <input type="text" className="form-control" placeholder="Name" name="name" value={contact.name} onInput={handleInputValue} />
                                    </div>
                                    {/* <div className="mb-2">
                                            <input type="url" className="form-control" placeholder="Photo URL" name="photoUrl" value={contact.photoUrl} onInput={handleInputValue} />
                                        </div> */}
                                    <div className="mb-2">
                                        <input type="tel" className="form-control" placeholder="Mobile" name="mobile" value={contact.mobile} onInput={handleInputValue} />
                                    </div>
                                    <div className="mb-2">
                                        <input type="email" className="form-control" placeholder="Email" name="email" value={contact.email} onInput={handleInputValue} />
                                    </div>
                                    <div className="mb-2">
                                        <input type="text" className="form-control" placeholder="Company" name="company" value={contact.company} onInput={handleInputValue} />
                                    </div>
                                    <div className="mb-2">
                                        <input type="text" className="form-control" placeholder="Title" name="title" value={contact.title} onInput={handleInputValue} />
                                    </div>
                                    <div className="mb-2">
                                        <select className='form-control' name='groupId' value={contact.groupId} onChange={handleInputValue}>
                                            <option value={-1} key={-1} disabled selected>Select a Group</option>
                                            {
                                                groups.map((group) => (
                                                    <option value={group.id} key={group.id}>{group.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <button type='submit' className='btn btn-success me-2'>Edit</button>
                                        <Link to={"/cg-contact/contact/list"} className="btn btn-dark">Close</Link>
                                    </div>
                                </form>
                            </div>
                            <div className='col-4'>
                                <div className='d-flex flex-column align-items-center avatar'>
                                    <img className='avatar-lg' src={contact.photoUrl} alt=""
                                        onClick={() => document.querySelector("#fileAvatar").click()}
                                    />
                                    <span className='select-avatar'>Select an Avatar</span>
                                    <input className="form-control d-none" accept='image/*' type="file" id="fileAvatar" onChange={changeAvatar} />
                                    {
                                        select.uploading ? (
                                            <button className="btn btn-primary" type="button" disabled>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                                Loading...
                                            </button>
                                        ) : <button className='btn btn-primary mt-2' onClick={handleUpload}>Change Avatar</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </section>
    </>
);
}

export default EditContact;
