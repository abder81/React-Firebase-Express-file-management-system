import {
  faFileAlt,
  faFileAudio,
  faFileImage,
  faFileVideo,
  faFolder,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  getAdminFiles,
  getAdminFolders,
  getUserFiles,
  getUserFolders,
  selectItem,
  selectFolder,
  deselectAll,
  deselectItem,
} from '../../../redux/actionCreators/filefoldersActionCreators.js';
import SubNav from '../SubNav.js/index.jsx';
import SearchBar from '../../SearchBar/index.jsx';

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    isLoading,
    adminFolders,
    allUserFolders,
    allUserFiles,
    userId,
    selectedItems,
  } = useSelector(
    (state) => ({
      isLoading: state.filefolders.isLoading,
      adminFolders: state.filefolders.adminFolders,
      allUserFolders: state.filefolders.userFolders,
      allUserFiles: state.filefolders.userFiles,
      userId: state.auth.userId,
      selectedItems: state.filefolders.selectedItems,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (isLoading) {
      dispatch(getAdminFolders());
      dispatch(getAdminFiles());
    }
    if (!allUserFolders) {
      dispatch(getUserFiles(userId));
      dispatch(getUserFolders(userId));
    }
  }, [dispatch, isLoading, allUserFolders, userId]);

  if (isLoading) {
    return (
      <Row>
        <Col>
          <h1 className="text-center my-5">Loading...</h1>
        </Col>
      </Row>
    );
  }

  // derive root-level folders and files
  const userFolders = allUserFolders?.filter((f) => f.data.parent === '');
  const createdFiles = allUserFiles?.filter(
    (f) => f.data.parent === '' && !f.data.url
  );
  const uploadedFiles = allUserFiles?.filter(
    (f) => f.data.parent === '' && f.data.url
  );

  // filtered lists
  const filteredCreated =
    searchTerm.length >= 3
      ? createdFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : createdFiles;
  const filteredUploaded =
    searchTerm.length >= 3
      ? uploadedFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : uploadedFiles;

  // global search matches
  const matches =
    searchTerm.length >= 3
      ? allUserFiles.filter((f) =>
          f.data.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  const isItemSelected = (docId) =>
    !!selectedItems.find((item) => item.docId === docId);

  const breadcrumb = (file) =>
    (file.data.path || []).map((p) => p.name).join(' / ') || 'root';

  const openInFolder = (file) => {
    dispatch(deselectAll());
    const path = file.data.path || [];
    const parentId = path.length > 0 ? path[path.length - 1].id : '';
    if (parentId) {
      history.push(`/dashboard/folder/${parentId}`);
    } else {
      history.push('/dashboard');
    }
    dispatch(selectItem({ docId: file.docId, data: file.data, type: 'file' }));
    setSearchTerm('');
  };

  const toggleSelect = (docId, data, type = 'folder') => {
    if (isItemSelected(docId)) {
      dispatch(deselectItem({ docId }));
    } else {
      if (type === 'folder') dispatch(selectFolder({ docId, data }));
      else dispatch(selectItem({ docId, data, type: 'file' }));
    }
  };

  const changeRoute = (url) => {
    dispatch(deselectAll());
    history.push(url);
  };

  return (
    <>
      <SearchBar value={searchTerm} onChange={setSearchTerm} />

      {searchTerm.length >= 3 && (
        <div className="search-results px-5">
          {matches.length > 0 ? (
            matches.map((file) => (
              <div
                key={file.docId}
                className="search-item py-1 border-bottom"
                style={{ cursor: 'pointer' }}
                onClick={() => openInFolder(file)}
              >
                <strong>{file.data.name}</strong>
                <small className="text-muted"> — {breadcrumb(file)}</small>
              </div>
            ))
          ) : (
            <div className="text-muted px-2 py-1">No results found 😞</div>
          )}
        </div>
      )}

      <SubNav currentFolder="root folder" />

      {adminFolders?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Admin Folders</p>
          <Row className="pt-2 pb-4 px-5" style={{ height: 150 }}>
            {adminFolders.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() =>
                  history.push(`/dashboard/folder/admin/${docId}`)
                }
                onClick={() => toggleSelect(docId, data, 'folder')}
                className={
                  `border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`
                }
              >
                <FontAwesomeIcon icon={faFolder} size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {userFolders?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Created Folders</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {userFolders.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() => changeRoute(`/dashboard/folder/${docId}`)}
                onClick={() => toggleSelect(docId, data, 'folder')}
                className={
                  `border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`
                }
              >
                <FontAwesomeIcon icon={faFolder} size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {filteredCreated?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Created Files</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {filteredCreated.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() => changeRoute(`/dashboard/file/${docId}`)}
                onClick={() => toggleSelect(docId, data, 'file')}
                className={
                  `border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`
                }
              >
                <FontAwesomeIcon icon={faFileAlt} size="3x" />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {filteredUploaded?.length > 0 && (
        <>
          <p className="text-center border-bottom py-2">Uploaded Files</p>
          <Row className="pt-2 gap-2 pb-4 px-5">
            {filteredUploaded.map(({ data, docId }) => (
              <Col
                key={docId}
                md={2}
                onDoubleClick={() => changeRoute(`/dashboard/file/${docId}`)}
                onClick={() => toggleSelect(docId, data, 'file')}
                className={
                  `border h-100 d-flex flex-column align-items-center justify-content-center rounded-2 py-1
                  ${isItemSelected(docId) ? 'selected-item text-white shadow-sm' : ''}`
                }
              >
                <FontAwesomeIcon
                  icon={
                    data.name.toLowerCase().match(/\.(png|jpe?g|svg|gif)$/)
                      ? faFileImage
                      : data.name.toLowerCase().match(/\.(mp4|mpeg|webm)$/)
                      ? faFileVideo
                      : data.name.toLowerCase().endsWith('.mp3')
                      ? faFileAudio
                      : faFileAlt
                  }
                  size="3x"
                />
                <p className="mt-2">{data.name}</p>
              </Col>
            ))}
          </Row>
        </>
      )}

      {(!adminFolders?.length &&
        !userFolders?.length &&
        !filteredCreated?.length &&
        !filteredUploaded?.length) && (
        <Row>
          <Col md="12">
            <p className="text-center my-5">No items to display.</p>
          </Col>
        </Row>
      )}
    </>
  );
};

export default Home;
