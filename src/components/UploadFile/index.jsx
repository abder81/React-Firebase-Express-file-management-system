import React, { useState } from "react";
import { faFileUpload, faTimes } from "@fortawesome/free-solid-svg-icons";
import { Button, Modal, ProgressBar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { addFileUser } from "../../redux/actionCreators/filefoldersActionCreators";
import { storage } from '../../API/firebase';  // Firebase Storage reference

const UploadFile = ({ currentFolder }) => {
  const [showModal, setShowModal] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({}); // track progress per file
  const dispatch = useDispatch();
  const { userId, userFiles } = useSelector(
    (state) => ({
      userId: state.auth.userId,
      userFiles: state.filefolders.userFiles,
    }),
    shallowEqual
  );

  const handleFileSubmit = (e) => {
    e.preventDefault();
    if (!files.length) return toast.dark("Please choose files!");

    files.forEach((file) => {
      if (file.type !== "application/pdf") {
        toast.dark(`Skipping ${file.name}: only PDF allowed`);
        return;
      }
      // duplicate check
      const duplicates = currentFolder === "root folder"
        ? userFiles.filter(f => f.data.parent === "" && f.data.name === file.name)
        : userFiles.filter(f => f.data.parent === currentFolder.docId && f.data.name === file.name);
      if (duplicates.length) {
        toast.dark(`Skipping ${file.name}: already exists`);
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "http://localhost:5000/upload");

      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setProgress(prev => ({
            ...prev,
            [file.name]: (ev.loaded / ev.total) * 100
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          const { url } = JSON.parse(xhr.responseText);
          dispatch(addFileUser({
            uid: userId,
            parent: currentFolder?.docId || "",
            data: "",
            name: file.name,
            url,
            path: currentFolder === "root folder"
              ? []
              : [...currentFolder.data.path, { id: currentFolder.docId, name: currentFolder.data.name }]
          }));
          toast.success(`${file.name} uploaded successfully!`);
        } else {
          toast.error(`Error uploading ${file.name}`);
        }
        // clear progress for this file
        setProgress(prev => {
          const { [file.name]: _, ...rest } = prev;
          return rest;
        });
      };
      xhr.onerror = () => toast.error(`Upload failed: ${file.name}`);
      xhr.send(formData);
    });

    setFiles([]);
    setShowModal(false);
  };

  return (
    <>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header>
          <Modal.Title>Upload PDF Files</Modal.Title>
          <Button variant="white" style={{ cursor: "pointer" }} onClick={() => setShowModal(false)}>
            <FontAwesomeIcon icon={faTimes} />
          </Button>
        </Modal.Header>
        <Modal.Body>
          {Object.keys(progress).length > 0 ? (
            Object.entries(progress).map(([name, pct]) => (
              <div key={name} className="mb-2">
                <small>{name}</small>
                <ProgressBar now={pct} label={`${Math.round(pct)}%`} />
              </div>
            ))
          ) : (
            <form onSubmit={handleFileSubmit}>
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />
              <Button type="submit" className="form-control mt-4" variant="primary">
                Upload PDFs
              </Button>
            </form>
          )}
        </Modal.Body>
      </Modal>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline-dark"
        className="border-1 d-flex align-items-center justify-content-between rounded-2"
      >
        <FontAwesomeIcon icon={faFileUpload} />
        &nbsp; Upload Files
      </Button>
    </>
  );
};

export default UploadFile;
